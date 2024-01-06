import React, { ChangeEvent, FormEvent, useState } from "react"
import './RegisterAndLoginCSS.css'
const RegisterAndLoginComp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [nameError, setNameError] = useState<string>('');

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email address');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = () => {
        // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters with one uppercase, one lowercase, and one digit.');
        } else {
            setPasswordError('');
        }
    };
    const validateName = () => {
        console.log(name);

        if (name === '') {
            setNameError('Please enter name ');
        } else {
            setNameError('')
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        // Validate email on input change
        validateEmail();
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        // Validate Name on input change
        validateName();
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        // Validate password on input change
        validatePassword();
    };

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Additional registration logic can go here
        // For now, just log the email and password
        let payload = {
            name: name,
            password: password,
            email: email
        }
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <div className="container">
            <div className="register-card">
                <h2 className="card-title">Register</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="input-group">
                        <label>Email:</label>
                        <input type="text" value={email} onChange={handleEmailChange} />
                        {emailError && <p className="error">{emailError}</p>}
                    </div>
                    <div className="input-group">
                        <label>Name:</label>
                        <input type="text" value={name} onSelect={handleNameChange} onInput={handleNameChange} />
                        {nameError && <p className="error">{nameError}</p>}
                    </div>
                    <div className="input-group">
                        <label>Password:</label>
                        <input type="password" value={password} onChange={handlePasswordChange} />
                        {passwordError && <p className="error">{passwordError}</p>}
                    </div>
                    <button type="submit" disabled={!!emailError || !!passwordError}>
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};
export default RegisterAndLoginComp