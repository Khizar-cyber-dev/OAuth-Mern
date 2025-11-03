import { generateToken, getStoredRefreshToken, removeRefreshToken, storeRefreshToken, verifyToken, setCookies } from "../lib/Token&Cookies.js";
import User from "../model/User.js";

export const register = async (req, res) => {
    console.log("Received body:", req.body); 
  const { name, email, password } = req.body;
    console.log(name, email, password);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    user.password = undefined; 

    res.status(201).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "User registered successfully" 
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try{
    const user = await User.findOne({ email });
    if (user && await user.comparePassword(password)) {
        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        user.password = undefined;
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          message: "Login successful"
        });
    }else{
       return res.status(400).json({ message: "Invalid email or password" });
    }
  }catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error:", error });
  }
}

export const logOut = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try{
      if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

  const decoded = verifyToken(refreshToken, 'refresh');

  if (!decoded) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  await removeRefreshToken(decoded.userId);

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: "Logged out successfully" });
  }catch(error){
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error:", error  });
  }

}

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try{
    const decoded = verifyToken(refreshToken, 'refresh');

    if (!decoded) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    const storedToken = await getStoredRefreshToken(decoded.userId);

    if (storedToken !== refreshToken) {
      return res.status(400).json({ message: "Refresh token mismatch" });
    }

    const { accessToken } = generateToken(decoded.userId);
    setCookies(res, accessToken);
    res.status(200).json({ accessToken, message: "Token refreshed" });
  }catch(error){
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error:", error  });
  }
}


export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};