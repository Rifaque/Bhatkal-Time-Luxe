import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  return (
    <div className="!bg-[#2A2A2A] text-white min-h-screen flex flex-col justify-center items-center p-4">
      <CheckCircle size={100} className="text-[#D1B23E] mb-6" />
      
      <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
      
      {orderId && (
        <p className="text-gray-300 mb-2">
          Order ID: <span className="font-semibold">{orderId}</span>
        </p>
      )}
      
      {total && (
        <p className="text-xl font-semibold mb-6">
          Total: &#8377; {new Intl.NumberFormat('en-IN').format(total)}
        </p>
      )}
      
      <p className="text-center text-gray-400 mb-6">
        Thank you for your purchase. 
        We'll send you a confirmation message shortly.
      </p>
      
      <div className="flex space-x-4">
        <Button 
          onClick={() => navigate('/')}
          className="!bg-[#D1B23E] text-black"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}