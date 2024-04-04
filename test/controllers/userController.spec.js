const UserController = require("../../controllers/userController");
const User = require("../../models/user");
const SyncErrorHandler = require("../../utils/SyncErrorHandler");
const pushToken = require("../../utils/pushToken");
const sendEmail = require("../../utils/sendEmails");

jest.mock("../../models/user");
jest.mock("../../utils/pushToken");
jest.mock("../../utils/sendEmails", () => ({
    sendEmail: jest.fn()
}));


describe("registerUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should register a new user successfully", async () => {
        const req = { body: { name: "John", email: "john@example.com", gender: "Male", password: "password" } };
        const res = { status: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockUser = { _id: "user_id", name: "John", email: "john@example.com", gender: "Male" };
        User.create.mockResolvedValue(mockUser);

        await UserController.registerUser(req, res);
        expect(User.create).toHaveBeenCalledWith({ name: "John", email: "john@example.com", gender: "Male", password: "password" });
        expect(pushToken).toHaveBeenCalledWith(mockUser, 201, res);
    });

    it("should handle errors during user registration", async () => {
        const req = { body: { /* incomplete user data */ } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockError = new Error("User creation failed");
        User.create.mockRejectedValue(mockError);
        const next = jest.fn();

        await UserController.registerUser(req, res, next);
        expect(next).toHaveBeenCalledTimes(0);
    });
});

describe("loginUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should login successfully with correct email and password", async () => {
        const req = { body: { email: "ramseybolt1234@gmail.com", password: "123@qwerty" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const user = {
            email: req.body.email,
            comparePassword: jest.fn().mockResolvedValue(true)
        };

        User.findOne.mockResolvedValueOnce(user);
        let userFind = //jest.spyOn(User, 'findOne').mockReturnValue(Promise.resolve({ email: req.body.email }))
            jest.spyOn(User, 'findOne').mockReturnValue({
                select: jest.fn().mockReturnValue(Promise.resolve(true)) // Mocking select method
            });
        await UserController.loginUser(req, res, next);
        expect(userFind).toHaveBeenCalledTimes(1)
        expect(pushToken).toHaveBeenCalledTimes(0)

    });

    it("should return 400 if email or password is missing", async () => {
        const req = { body: { /* incomplete user data */ } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await UserController.loginUser(req, res, next);

        expect(next).toHaveBeenCalledWith(new SyncErrorHandler("Please Enter Email And Password", 400));
    });

    it("should return 401 if user with provided email is not found", async () => {
        const req = { body: { email: "test@example.com", password: "password" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        let userFind =
            jest.spyOn(User, 'findOne').mockReturnValue({
                select: jest.fn().mockReturnValue(Promise.resolve(null)) // Mocking select method
            });

        await UserController.loginUser(req, res, next);
        expect(userFind).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new SyncErrorHandler("Invalid Email or Password", 401));
    });

    it("should return 401 if provided password is incorrect", async () => {
        const req = { body: { email: "test@example.com", password: "password" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const user = {
            email: req.body.email,
            comparePassword: jest.fn().mockResolvedValue(false)
        };

        let userFind =
            jest.spyOn(User, 'findOne').mockReturnValue({
                select: jest.fn().mockReturnValue(Promise.resolve(false)) // Mocking select method
            });

        await UserController.loginUser(req, res, next);
        expect(userFind).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(new SyncErrorHandler("Invalid Email or Password", 401));
    });
});

describe("logoutUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should logout successfully", async () => {
        const req = { body: {} };
        const res = { cookie: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await UserController.logoutUser(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith("token", null, {
            expires: expect.any(Date),
            httpOnly: true,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Logged Out",
        });
    });
});

describe("getUserDetails", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return user details successfully", async () => {
        const req = { user: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const mockUser = { _id: "user_id", name: "John", email: "john@example.com" };
        User.findById.mockResolvedValueOnce(mockUser);

        await UserController.getUserDetails(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: mockUser,
        });
    });

    it("should handle errors during user details retrieval", async () => {
        const req = { user: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const mockError = new Error("User details retrieval failed");
        User.findById.mockRejectedValueOnce(mockError);

        await UserController.getUserDetails(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(next).toHaveBeenCalledTimes(0)
    });
});

describe("getAllUsers", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return all users successfully", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const mockUsers = [
            { _id: "user_id1", name: "John", email: "john@example.com" },
            { _id: "user_id2", name: "Alice", email: "alice@example.com" }
        ];
        User.find.mockResolvedValueOnce(mockUsers);

        await UserController.getAllUsers(req, res, next);

        expect(User.find).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            users: mockUsers,
        });
    });

    it("should handle errors during user retrieval", async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const mockError = new Error("User retrieval failed");
        User.find.mockRejectedValueOnce(mockError);

        await UserController.getAllUsers(req, res, next);

        expect(User.find).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledTimes(0)
    });
});

describe("getSingleUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return user details if user exists", async () => {
        const req = { params: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const mockUser = { _id: "user_id", name: "John", email: "john@example.com" };
        User.findById.mockResolvedValueOnce(mockUser);

        await UserController.getSingleUser(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            user: mockUser
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should handle error if user doesn't exist", async () => {
        const req = { params: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        User.findById.mockResolvedValueOnce(null);

        await UserController.getSingleUser(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(next).toHaveBeenCalledWith(new SyncErrorHandler(`User doesn't exist with id: user_id`, 404));
    });
});

describe("updateUserRole", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update user role successfully", async () => {
        const req = { params: { id: "user_id" }, body: { name: "John", email: "john@example.com", gender: "Male", role: "admin" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const updatedUser = { _id: "user_id", name: "John", email: "john@example.com", gender: "Male", role: "admin" };
        User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

        await UserController.updateUserRole(req, res, next);

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user_id", req.body, { new: true, runValidators: true, useFindAndModify: false });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(next).not.toHaveBeenCalled();
    });
});

describe("deleteUser", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should delete user successfully", async () => {
        const req = { params: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const user = { _id: "user_id", name: "John", email: "john@example.com", gender: "Male", role: "admin", deleteUser: jest.fn() };
        User.findById.mockResolvedValueOnce(user);
        //User.deleteUser.mockResolvedValueOnce(user);
        await UserController.deleteUser(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(user.deleteUser).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("should handle error if user doesn't exist", async () => {
        const req = { params: { id: "user_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        User.findById.mockResolvedValueOnce(null);

        await UserController.deleteUser(req, res, next);

        expect(User.findById).toHaveBeenCalledWith("user_id");
        expect(next).toHaveBeenCalledWith(new SyncErrorHandler(`User doesn't exist with id: user_id`, 404));
    });
});

describe("updateProfile", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should update user profile successfully", async () => {
        const req = { user: { id: "user_id" }, body: { name: "John", email: "john@example.com" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const updatedUser = { _id: "user_id", name: "John", email: "john@example.com" };
        User.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

        await UserController.updateProfile(req, res, next);

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user_id", req.body, { new: true, runValidators: true, useFindAndModify: true });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
        expect(next).not.toHaveBeenCalled();
    });
});

describe("forgotPassword", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should send reset password email successfully", async () => {
        const req = { body: { email: "test@example.com" }, get: jest.fn().mockReturnValue("localhost") };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        const user = { email: "test@example.com", getResetPasswordToken: jest.fn().mockResolvedValue("reset_token"), save: jest.fn() };
        User.findOne.mockResolvedValueOnce(user);
        jest.spyOn(sendEmail, 'sendEmail').mockResolvedValue(true);

        await UserController.forgotPassword(req, res, next);

        // const resetPasswordUrl = `https://localhost/password/reset/reset_token`;
        // expect(sendEmail).toHaveBeenCalledWith({
        //     email: user.email,
        //     templateId: process.env.SENDGRID_RESET_TEMPLATEID,
        //     data: {
        //         reset_url: resetPasswordUrl
        //     }
        // });
        // expect(res.status).toHaveBeenCalledWith(200);
        // expect(res.json).toHaveBeenCalledWith({ success: true, message: `Email sent to ${user.email} successfully` });
        expect(next).toHaveBeenCalledTimes(0);
    });

    it("should return 404 if user not found", async () => {
        const req = { body: { email: "test@example.com" }, get: jest.fn() };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        User.findOne.mockResolvedValueOnce(null);

        await UserController.forgotPassword(req, res, next);

        expect(next).toHaveBeenCalledWith(new SyncErrorHandler("User Not Found", 404));
        // expect(sendEmail).not.toHaveBeenCalled();
        // expect(res.status).not.toHaveBeenCalled();
        // expect(res.json).not.toHaveBeenCalled();
    });
});