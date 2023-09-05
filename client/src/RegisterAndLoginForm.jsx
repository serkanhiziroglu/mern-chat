import { useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";
import { useContext } from "react";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext)
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register')
    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'Register' ? 'Register' : 'Login'
        const { data } = await axios.post(url, { username, password })
        setLoggedInUsername(username)

    }
    return (
        <div className="bg-blue-300 h-screen flex items-center">
            <form className="w-64 mx-auto" onSubmit={handleSubmit}>
                <input
                    value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text" placeholder="username" className="block w-full mb-2 border" />
                <input
                    value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password" placeholder="password" className="block w-full mb-2" />
                <button className="bg-blue-600 text-white block rounded-sm w-full p-2">{isLoginOrRegister === 'Register' ? 'Register' : 'Login'}</button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'Register' && (
                        <div>Already a member?<br />
                            <button onClick={() => setIsLoginOrRegister('Login')}>Login here.</button>

                        </div>
                    )}
                    {isLoginOrRegister === 'Login' && (
                        <div> Don&#39;t have an account ?
                            <button onClick={() => setIsLoginOrRegister('Register')}>Register here.</button>

                        </div>
                    )}
                </div>
            </form>

        </div>
    )
}