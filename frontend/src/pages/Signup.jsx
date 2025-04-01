import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const { data } = await axios.post("http://localhost:3000/auth/signup", { email, password });
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess("Signup Successful! You can now log in.");
                setError(""); 
            }
        } catch (err) {
            setError("Something went wrong.");
        }
    };

    return (
        <div className="w-screen flex justify-center items-center h-screen bg-gray-100">
            <div className="p-6 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-xl font-semibold text-center mb-4">Sign Up</h2>
                {success ? (
                    <p className="text-green-500 text-center">{success}</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : null}
                
                <form onSubmit={handleSignup} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-2 border rounded"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-red-500 mt-4">
                    Already have an account? <Link to="/login" className="text-blue-500">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;