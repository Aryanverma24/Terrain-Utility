import Tesseract from "tesseract.js";
import fs from "fs/promises";
import Sanscript from "sanscript";

export const extractSaleDeed = async (req, res) => {
  let filePaths = [];

  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    filePaths = files.map((f) => f.path);

    let combinedText = "";

    // ================= OCR =================
    for (const file of files) {
      const result = await Tesseract.recognize(file.path, "hin+eng", {
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      });

      combinedText += " " + result.data.text;
    }

    // ================= NORMALIZATION =================
    const normalizedText = combinedText
      .replace(/।/g, ".")
      .replace(/[|•]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/(\d)\s+(\d)/g, "$1$2")
      .replace(/O/g, "0")
      .trim();

    // ================= LANGUAGE DETECTION =================
    const detectLanguage = (text) => {
      const hindi = (text.match(/[\u0900-\u097F]/g) || []).length;
      const eng = (text.match(/[A-Za-z]/g) || []).length;
      return hindi > eng ? "hindi" : "english";
    };

    const lang = detectLanguage(normalizedText);

    // ================= NAME CLEANER =================
    const cleanName = (val) => {
      if (!val) return null;

      return val
        .replace(/(विक्रेता|क्रेता|Vendor|Purchaser|गवाह)/gi, "")
        .replace(/(पुत्र|पत्नी|son|wife).*/i, "")
        .replace(/\b(यह|विक्रय|विलेख|किया|गया|साक्ष्य|स्वरूप)\b/gi, "")
        .replace(/[^A-Za-z\u0900-\u097F\s]/g, "")
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(" ");
    };

    // ================= TRANSLITERATION =================
    const transliterateToEnglish = (text) => {
      if (!text) return null;

      try {
        let result = Sanscript.t(text, "devanagari", "itrans");

        result = result
          .toLowerCase()
          .replace(/aa/g, "a")
          .replace(/ii/g, "i")
          .replace(/uu/g, "u")
          .replace(/ee/g, "i")
          .replace(/oo/g, "u")
          .replace(/([a-z])\1+/g, "$1")
          .replace(/[^a-z\s]/g, "")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return result;
      } catch (e) {
        return text;
      }
    };

    // ================= ROLE KEYWORDS =================
    const ROLE_KEYWORDS = {
      owner: ["Vendor", "Seller", "Transferor", "Executant", "Owner", "विक्रेता"],
      buyer: ["Purchaser", "Buyer", "Transferee", "Claimant", "क्रेता"],
    };

    // ================= ROLE EXTRACTION =================
    const extractPartyByRole = (text, roleKeywords) => {
      for (const keyword of roleKeywords) {
        const p2 = new RegExp(
          `${keyword}\\s*[:\\-]\\s*([A-Za-z\\u0900-\\u097F\\s]{3,40})`,
          "i"
        );
        const m2 = text.match(p2);
        if (m2) return cleanName(m2[1]);

        const p1 = new RegExp(
          `([A-Za-z\\u0900-\\u097F\\s]{3,50}?)\\s*,?\\s*(?:पुत्र|son).*?\\(.*?${keyword}.*?\\)`,
          "i"
        );
        const m1 = text.match(p1);
        if (m1) return cleanName(m1[1]);

        if (["Vendor", "Seller", "विक्रेता"].includes(keyword)) {
          const m3 = text.match(/Between\s+([A-Za-z\u0900-\u097F\s]+?),\s*(son|पुत्र)/i);
          if (m3) return cleanName(m3[1]);
        }

        if (["Purchaser", "Buyer", "क्रेता"].includes(keyword)) {
          const m4 = text.match(/AND\s+([A-Za-z\u0900-\u097F\s]+?),\s*(son|पुत्र)/i);
          if (m4) return cleanName(m4[1]);
        }
      }
      return null;
    };

    // ================= SCHEDULE BLOCK =================
    const getScheduleBlock = (text) => {
      const match = text.match(/(SCHEDULE|अनुसूची)([\s\S]*)/i);
      return match ? match[2] : text;
    };

    const scheduleText = getScheduleBlock(normalizedText);

    // ================= FIELD EXTRACTION =================
    const extractField = (label, text) => {
      const regex = new RegExp(`${label}[:\\s]*([^,\\n]{1,60})`, "i");
      const match = text.match(regex);
      if (!match) return null;

      let value = match[1];

      value = value.split(
        /(Village|Tehsil|District|State|Area|Boundaries|ग्राम|तहसील|जिला|राज्य|सीमाएं|क्षेत्रफल)/i
      )[0];

      return value.replace(/[:.]/g, "").trim();
    };

    const extractPincode = (text) => {
      const matches = text.match(/(?:पिन|pin)?\s*[:\-]?\s*([\dO\s]{5,10})/gi);
      if (!matches) return null;

      for (let raw of matches) {
        let cleaned = raw.replace(/[^0-9O]/gi, "").replace(/O/g, "0");
        if (cleaned.length === 5) cleaned += "0";
        if (cleaned.length === 6) return cleaned;
      }

      return null;
    };

    const finalClean = (val) => {
      if (!val) return null;
      return val.split(/(क्षेत्रफल|सीमाएं|ग्राम|जिला|राज्य|Area|Boundaries)/)[0].trim();
    };

    // ================= PARTY EXTRACTION =================
    const extractPartiesFromSchedule = (text) => {
      let owner = null;
      let buyer = null;

      const sellerMatch = text.match(
        /विक्रेता\s*[:\-]\s*([A-Za-z\u0900-\u097F\s]+?)\s+क्रेता/i
      );

      if (sellerMatch) {
        owner = sellerMatch[1].trim();
      }

      const buyerMatch = text.match(
        /क्रेता\s*[:\-]\s*([A-Za-z\u0900-\u097F\s]+?)(?:\s+गवाह|$)/i
      );

      if (buyerMatch) {
        buyer = buyerMatch[1].trim();
      }

      return {
        owner: cleanName(owner),
        buyer: cleanName(buyer),
      };
    };

    const scheduleParties = extractPartiesFromSchedule(scheduleText);

    let owner = scheduleParties.owner;
    let buyer = scheduleParties.buyer;

    if (!owner) {
      owner =
        extractPartyByRole(normalizedText, ROLE_KEYWORDS.owner) ||
        cleanName(extractField("विक्रेता", normalizedText));
    }

    if (!buyer) {
      buyer =
        extractPartyByRole(normalizedText, ROLE_KEYWORDS.buyer) ||
        cleanName(extractField("क्रेता", normalizedText));
    }

    owner = finalClean(owner);
    buyer = finalClean(buyer);

    // ================= FINAL EXTRACTION =================
    const extraction = {
      ownerName: owner,
      buyerName: buyer,

      khasraNumber:
        extractField("Khasra No", scheduleText) ||
        extractField("खसरा", scheduleText),

      village:
        extractField("Village", scheduleText) ||
        extractField("ग्राम", scheduleText),

      city:
        extractField("District", scheduleText) ||
        extractField("जिला", scheduleText),

      state:
        extractField("State", scheduleText) ||
        extractField("राज्य", scheduleText),

      area:
        extractField("Area", scheduleText) ||
        extractField("क्षेत्रफल", scheduleText),

      pincode: extractPincode(normalizedText),

      detectedLanguage: lang,
      rawText: normalizedText,
      status: "pending",
    };

    // ================= CONFIDENCE =================
    const getConfidence = (val) => {
      if (!val) return "low";
      if (val.length > 15) return "high";
      if (val.length > 6) return "medium";
      return "low";
    };

    // ================= FINAL OUTPUT =================
    const finalOutput = {};

    Object.keys(extraction).forEach((key) => {
      if (["rawText", "status", "detectedLanguage"].includes(key)) {
        finalOutput[key] = extraction[key];
      } else {
        finalOutput[key] = {
          value: extraction[key],
          confidence: getConfidence(extraction[key]),
        };
      }
    });

    // ================= TRANSLITERATION (ONLY HINDI) =================
    if (lang === "hindi") {
      finalOutput.transliterated = {
        ownerName_en: transliterateToEnglish(owner),
        buyerName_en: transliterateToEnglish(buyer),
        village_en: transliterateToEnglish(extraction.village),
        city_en: transliterateToEnglish(extraction.city),
        state_en: transliterateToEnglish(extraction.state),
      };
    }

    // ================= CLEANUP =================
    await Promise.all(filePaths.map((p) => fs.unlink(p).catch(() => {})));

    return res.status(200).json(finalOutput);

  } catch (error) {
    console.error("OCR ERROR:", error);

    await Promise.all(filePaths.map((p) => fs.unlink(p).catch(() => {})));

    return res.status(500).json({
      message: "OCR extraction failed",
      error: error.message,
    });
  }
};