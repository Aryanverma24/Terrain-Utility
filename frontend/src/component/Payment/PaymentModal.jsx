import PaymentWrapper from './PaymentWrapper';

const PaymentModal = ({ isOpen, onClose, land, onSuccess }) => {
  const payableAmount =
  land?.transferStatus === 'token_paid'
    ? land.price
    : land?.tokenConfig?.amount || Math.round(land.price * 0.05);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500">
          ✖
        </button>

        <h2 className="text-lg font-semibold mb-4">Complete Payment</h2>

      <PaymentWrapper
  landId={land._id}
  price={payableAmount}
  land={land}
  onSuccess={onSuccess}
/>
      </div>
    </div>
  );
};

export default PaymentModal;
