import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
          const { data } = await axios.post("http://localhost:3000/auth/login", { email, password });
          if (data.error) {
              setError(data.error);
          } else {
              localStorage.setItem("token", data.token);
              if (data.user) {
                  localStorage.setItem("user", JSON.stringify(data.user)); 
              } else {
                  console.error("User data is missing from response");
              }
              setSuccess("Login Successful!");
              setTimeout(() => {
                  navigate("/dashboard");
              }, 5000);
          }
      } catch (err) {
          console.error("Login Error:", err);
          setError("Something went wrong.");
      }
  };
    return (
        <div className="w-screen flex justify-center items-center h-screen bg-gray-100">
            <div className="p-6 bg-white shadow-lg rounded-lg w-96">
                <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
                {success ? (<p className="text-green-500 text-center">{success}</p>
                ) : error ? (<p className="text-red-500 text-center">{error}</p>
            ) : null}
                <form onSubmit={handleLogin} className="space-y-4">
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
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                        Login
                    </button>
                    <p className="text-center text-red-500 mt-4">
                    Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
                </p>
                </form>
            </div>
        </div>
    );
};

export default Login;