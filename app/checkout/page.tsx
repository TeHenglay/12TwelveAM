'use client';

import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../store/useCart';
import { useRouter } from 'next/navigation';
import OrderSuccessModal from '../components/OrderSuccessModal';

interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  instagram: string;
  province: string;
  address: string;
  paymentProofUrl?: string;
}

interface OrderSummaryItem {
  id: number;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  imageUrl: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);
  const [expiryTime, setExpiryTime] = useState(30 * 60); // 30 minutes in seconds
  const [purchaseLimit, setPurchaseLimit] = useState<any>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    phone: '',
    email: '',
    instagram: '',
    province: '',
    address: '',
    paymentProofUrl: ''
  });
  
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('');
  
  // Calculate delivery fee
  const deliveryFee = 1.00;
  const subtotal = total();
  const orderTotal = subtotal + deliveryFee;
  
  // Format prices
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to cart when timer expires
          router.push('/cart');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check purchase limits and get CSRF token on component mount
  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        // Check purchase limits
        const limitResponse = await fetch('/api/purchase-limit/check');
        if (limitResponse.ok) {
          const limitData = await limitResponse.json();
          setPurchaseLimit(limitData);
          
          // If purchase limit exceeded, redirect to cart with message
          if (!limitData.allowed) {
            router.push('/cart?error=purchase_limit_exceeded');
            return;
          }
        }
        
        // Get CSRF token
        const csrfResponse = await fetch('/api/csrf');
        const csrfData = await csrfResponse.json();
        if (csrfData.csrfToken) {
          setCsrfToken(csrfData.csrfToken);
        }
      } catch (error) {
        console.error('Error initializing checkout:', error);
      } finally {
        setIsCheckingLimit(false);
      }
    };
    
    initializeCheckout();
  }, [router]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      setUploadError('Please upload a payment proof to continue');
      return;
    }
    
    setIsSubmitting(true);
    setUploadError(null);
    
    try {
      // Import Zod schema
      const { checkoutSubmissionSchema } = await import('@/app/lib/validations');
      
      // Prepare order data
      const orderData = {
        ...form,
        paymentProofUrl: uploadedFile?.publicUrl || '',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: {
            size: item.variant?.size,
            color: item.variant?.color,
          }
        })),
        subtotal,
        deliveryFee,
        total: orderTotal
      };
      
      // Debug the uploaded file and URL
      console.log('Uploaded file details:', uploadedFile);
      console.log('Payment proof URL:', uploadedFile?.publicUrl);
      
      // Validate order data with Zod
      try {
        checkoutSubmissionSchema.parse(orderData);
      } catch (validationError: any) {
        console.error('Validation error details:', validationError);
        console.error('Order data being validated:', orderData);
        
        // Format validation errors - Zod errors have 'issues' property
        const formattedErrors = validationError.issues?.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        throw new Error(`Validation failed: ${formattedErrors || JSON.stringify(validationError.issues) || 'Invalid form data'}`);
      }
      
      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const createdOrder = await response.json();
        console.log('Order created successfully:', createdOrder);
        console.log('Order number:', createdOrder.orderNumber);
        
        // Clear cart and show success modal
        clearCart();
        setSuccessOrderNumber(createdOrder.orderNumber);
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setUploadError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleUploadSuccess = (fileData: any) => {
    console.log('Upload success - File data received:', fileData);
    setUploadedFile(fileData);
    setForm(prev => ({
      ...prev,
      paymentProofUrl: fileData.publicUrl
    }));
    setUploadError(null);
  };
  
  const handleUploadError = (error: string) => {
    console.log('Upload error:', error);
    setUploadError(error);
    setUploadedFile(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Checkout</h1>
        <div className="text-center mb-8">
          <span className="inline-flex items-center text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Expires in: {formatTime(expiryTime)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Customer Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your number"
                  className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">
                    Instagram (Optional)
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-1 font-medium">
                  Province/City <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Select your province</option>
                  <option value="Banteay Meanchey">Banteay Meanchey</option>
                  <option value="Battambang">Battambang</option>
                  <option value="Kampong Cham">Kampong Cham</option>
                  <option value="Kampong Chhnang">Kampong Chhnang</option>
                  <option value="Kampong Speu">Kampong Speu</option>
                  <option value="Kampong Thom">Kampong Thom</option>
                  <option value="Kampot">Kampot</option>
                  <option value="Kandal">Kandal</option>
                  <option value="Kep">Kep</option>
                  <option value="Koh Kong">Koh Kong</option>
                  <option value="Kratié">Kratié</option>
                  <option value="Mondulkiri">Mondulkiri</option>
                  <option value="Oddar Meanchey">Oddar Meanchey</option>
                  <option value="Pailin">Pailin</option>
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Preah Sihanouk">Preah Sihanouk</option>
                  <option value="Preah Vihear">Preah Vihear</option>
                  <option value="Prey Veng">Prey Veng</option>
                  <option value="Pursat">Pursat</option>
                  <option value="Ratanakiri">Ratanakiri</option>
                  <option value="Siem Reap">Siem Reap</option>
                  <option value="Stung Treng">Stung Treng</option>
                  <option value="Svay Rieng">Svay Rieng</option>
                  <option value="Takéo">Takéo</option>
                  <option value="Tbong Khmum">Tbong Khmum</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-1 font-medium">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter your complete delivery address"
                  className="w-full border border-gray-200 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-rose-300"
                ></textarea>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Order Summary
              </h2>
              
              {!isHydrated ? (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 mr-4"></div>
                    <div className="flex-grow">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant?.size || 'default'}`} className="flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-4">
                        {item.image && (
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={64} 
                            height={64} 
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <div className="text-sm text-gray-500">
                          Size: {item.variant?.size || 'N/A'} • Qty: {item.quantity}
                        </div>
                        <div className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 space-y-2">
                {!isHydrated ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium text-gray-800">{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-lg font-semibold text-gray-900">{formatPrice(orderTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Information
              </h2>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Scan QR Code for Payment</h3>
                <div className="inline-block bg-white p-4 border border-gray-200 rounded-md">
                  <div className="w-48 h-48 mx-auto">
                    <Image 
                      src="/qr-payment-code.png" 
                      alt="Payment QR Code" 
                      width={200} 
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scan this QR code to complete your payment
                </p>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  Total: ${orderTotal.toFixed(2)}
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center text-gray-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <label className="font-medium">
                    Payment Proof <span className="text-red-500">*</span>
                  </label>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <FileUpload
                    endpoint="/api/uploads/payment-proof"
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    maxSizeMB={5}
                    buttonText="Choose file"
                    className="mb-2"
                    csrfToken={csrfToken}
                  />
                  
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                  )}
                  
                  {uploadedFile && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        ✓ Payment proof uploaded successfully
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        File: {uploadedFile.originalName}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Please upload a screenshot of your payment confirmation
                    (max 5MB)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link href="/cart" className="flex-1">
                <button 
                  type="button"
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Cart
                </button>
              </Link>
              
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        orderNumber={successOrderNumber}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}