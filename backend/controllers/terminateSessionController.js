import Chat from '../modals/chatmodel.js';
import Case from '../modals/caseModal.js';

export const terminateSession = async (req, res) => {
  try {
    console.log('\n🔥 ===== TERMINATE SESSION STARTED =====');
    console.log('📌 PARAMS:', req.params);
    console.log('📌 BODY:', req.body);

    const { chatId, caseId } = req.params;
    const userId = req.user._id.toString();
    const { reasonType, reasonText } = req.body;

    const io = req.app.get('io');

    console.log('👤 USER ID:', userId);
    console.log('🔌 SOCKET IO AVAILABLE:', !!io);

    let targetChat = null;
    let targetCase = null;

    // ================================
    // CHAT FLOW
    // ================================
    if (chatId) {
      console.log('\n💬 ===== CHAT TERMINATION FLOW =====');

      targetChat = await Chat.findById(chatId);

      console.log('📦 CHAT FOUND:', !!targetChat);

      if (!targetChat) {
        console.log('❌ Chat not found');
        return res.status(404).json({ message: 'Chat not found' });
      }

      const isParticipant = targetChat.participants?.some((p) => p.toString() === userId);

      console.log('🔐 IS PARTICIPANT:', isParticipant);

      if (!isParticipant) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      console.log('📊 CHAT STATUS:', targetChat.status);

      if (targetChat.status === 'terminated') {
        return res.status(400).json({ message: 'Chat already terminated' });
      }
    }

    // ================================
    // CASE FLOW
    // ================================
    if (caseId) {
      console.log('\n⚖️ ===== CASE TERMINATION FLOW =====');

      targetCase = await Case.findById(caseId);

      console.log('📦 CASE FOUND:', !!targetCase);

      if (!targetCase) {
        return res.status(404).json({ message: 'Case not found' });
      }

      const allowedUsers = [
        targetCase.buyerId?.toString(),
        targetCase.ownerId?.toString(),
        targetCase.lawyerId?.toString(),
      ];

      console.log('🔐 ALLOWED USERS:', allowedUsers);
      console.log('👤 USER ID:', userId);

      if (!allowedUsers.includes(userId)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      console.log('📊 CASE STATUS:', targetCase.status);

      if (targetCase.status === 'closed') {
        return res.status(400).json({ message: 'Case already closed' });
      }
    }

    // ================================
    // CASE TERMINATION (IMPORTANT PART)
    // ================================
    if (targetCase) {
      console.log('\n🔥 CLOSING CASE...');

      targetCase.status = 'closed';
      targetCase.closedBy = userId;
      targetCase.closedAt = new Date();
      targetCase.closureReasonType = reasonType;
      targetCase.closureReasonText = reasonText;

      await targetCase.save();

      console.log('✅ CASE SAVED');

      // 🔥 FIND RELATED CHATS
      const chatsFound = await Chat.find({
        $or: [
          { caseId: targetCase._id },
          { _id: targetCase.buyerLawyerChat },
          { _id: targetCase.ownerLawyerChat },
        ],
      });

      console.log('🔗 RELATED CHATS COUNT:', chatsFound.length);

      const chatIds = chatsFound.map((c) => c._id.toString());

      console.log('📌 CHAT IDS:', chatIds);

      if (chatIds.length > 0) {
        const updateResult = await Chat.updateMany(
          { _id: { $in: chatIds } },
          {
            $set: {
              status: 'terminated',
              terminatedBy: userId,
              terminatedAt: new Date(),
              terminationReasonType: reasonType,
              terminationReasonText: reasonText,
            },
          },
        );

        console.log('🔥 CHAT UPDATE RESULT:', updateResult);

        // 🔥 SOCKET BROADCAST
        if (io) {
          console.log('📡 EMITTING chatTerminated EVENT (CASE FLOW)');

          io.emit('chatTerminated', {
            chatIds,
            caseId: targetCase._id.toString(),
            type: 'case',
          });
        } else {
          console.log('⚠️ SOCKET IO NOT AVAILABLE');
        }
      } else {
        console.log('❌ NO RELATED CHATS FOUND');
      }

      return res.status(200).json({
        success: true,
        message: 'Case closed and chats terminated',
        chatIds,
      });
    }

    // ================================
    // SINGLE CHAT TERMINATION
    // ================================
    if (targetChat) {
      console.log('\n🔥 TERMINATING SINGLE CHAT');

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          status: 'terminated',
          terminatedBy: userId,
          terminatedAt: new Date(),
          terminationReasonType: reasonType,
          terminationReasonText: reasonText,
        },
        { new: true },
      );

      console.log('✅ CHAT UPDATED:', updatedChat?._id);

      if (io) {
        console.log('📡 EMITTING chatTerminated EVENT (CHAT FLOW)');

        io.emit('chatTerminated', {
          chatIds: [chatId],
          caseId: null,
          type: 'chat',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Chat terminated successfully',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid request',
    });
  } catch (error) {
    console.error('\n❌ ===== TERMINATE SESSION ERROR =====');
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
