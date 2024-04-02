import { useState } from "react";
import { useAppSelector } from "../../../store/hooks";

import useAxios from "../../../hooks/useAxios";

const Index = () => {
    const [message, setMessage] = useState("");
    const user = useAppSelector((state) => state.auth.user);

    const api = useAxios();
    const handleResendEmail = async () => {
        try {
            const {data} = await api.get(`user/sendEmailToken/${user?.id}`);
            setMessage(data.message);
        } catch (error) {
            console.error("Error sending email:", error);
            setMessage("Error sending email. Please try again.");
        }
    };

    return (
        <div>
            <h1>We have sent a verification email to {user?.email}</h1>
            <button className="" onClick={handleResendEmail}>Resend</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Index;
