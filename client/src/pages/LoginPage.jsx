import { Link, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);
	const loginUser = async(e) => {
		e.preventDefault();
		try {
			const userInfo = await axios.post("/login", {
				email,
				password,
			});
            setUser(userInfo.data);
			alert("login successful");

            setRedirect(true);
		} catch (e) {
            console.log(e);
			alert("login failed");
		}
	};



    if(redirect){
        return <Navigate to="/" />
    }
	return (
		<div className="mt-4 grow flex items-center justify-around">
			<div className="mb-32">
				<h1 className="text-4xl text-center mb-4">Login</h1>
				<form className="max-w-md mx-auto" onSubmit={loginUser}>
					<input
						type="email"
						placeholder="your@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						type="password"
						placeholder="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button className="primary">Login</button>
					<div className="text-center py-2 text-gray-500">
						Dont have an account yet?{" "}
						<Link className="underline text" to="/register">
							Register now
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default LoginPage;
