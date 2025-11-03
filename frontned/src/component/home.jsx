import React from 'react'

const Home = () => {
     const handleLogin = () => {
    window.location.href = "https://oauth-mern.onrender.com/api/auth/github";
  };

  const handleLoginWithGoogle = () => {
    window.location.href = "https://oauth-mern.onrender.com/api/auth/google";
  };
  return (
    <div>
         <button onClick={handleLogin}>
      Sign in with GitHub
    </button>
    <button onClick={handleLoginWithGoogle}>
      Sign in with Google
    </button>
    </div>
  )
}

export default Home