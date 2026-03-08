import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true, // DEVE ser true se sameSite for 'none' (obriga HTTPS)
        sameSite: 'none', // Permite que o cookie viaje entre o frontend e o backend em domínios diferentes
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    return token;
};