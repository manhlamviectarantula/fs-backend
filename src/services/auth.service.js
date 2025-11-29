const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

class AuthService {

    static async generateAccessToken(user) {
        return jwt.sign({
            id: user.id,
            admin: user.isAdmin
        },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "2h" }
        )
    }

    static async generateRefreshToken(user) {
        return jwt.sign({
            id: user.id,
            admin: user.isAdmin
        },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" }
        )
    }

    static async registerUser(name, email, password, cPassword, phone, address) {
        try {

            if (!name || !email || !password || !cPassword || !phone || !address) {
                throw new Error('Chưa nhập đủ thông tin')
            }

            if (cPassword !== password) {
                throw new Error('Nhập lại mật khẩu chưa đúng')
            }

            const existingUser = await userModel.findOne({
                $or: [{ email: email }, { phone: phone }]
            });
            if (existingUser) {
                throw new Error('Email hoặc số điện thoại đã tồn tại');
            }

            const salt = await bcrypt.genSalt(10)
            const hashed = await bcrypt.hash(password, salt)

            const newUser = new userModel({
                name,
                email,
                password: hashed,
                phone,
                address
            })

            const userRegistered = await newUser.save()

            return {
                name: userRegistered.name,
                email: userRegistered.email,
                password: hashed,
                phone: userRegistered.phone,
                address: userRegistered.address
            };
        } catch (error) {
            throw error;
        }
    }

    static async loginUser(email, password) {
        if (!email || !password) throw new Error('Chưa nhập đủ thông tin');

        const user = await userModel.findOne({ email });
        if (!user) throw new Error('Email chưa được đăng ký');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error('Sai mật khẩu');

        const accessToken = await AuthService.generateAccessToken(user);
        const refreshToken = await AuthService.generateRefreshToken(user);

        const { password: pwd, ...userData } = user._doc;

        return { userData: { ...userData, accessToken }, refreshToken };
    }
}

module.exports = AuthService