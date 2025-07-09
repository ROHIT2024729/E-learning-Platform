import React from 'react';
import "./paymentsuccess.css";
import { useParams} from 'react-router-dom';
import { Link } from 'react-router-dom';
const PaymentSuccess = ({user}) => {
    const params = useParams();
    return(
        <div className="payment-success-page">
            {
                user && <div className='success-message'>
                    <h2>Payment Successful</h2>
                    <p>Your Course subscription has been activated</p>
                    <p>Reference no - {params.id}</p>
                    <Link to = {`/${user._id}/dashboard/`} className='common-btn'>
                    Go To Dashboard
                    </Link>
                    </div>
            }
        </div>
    )
}

export default PaymentSuccess;