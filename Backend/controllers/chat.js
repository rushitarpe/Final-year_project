const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Access or create a 1-on-1 chat
// @route   POST /api/chat
// @access  Private
exports.accessChat = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'UserId param not sent with request' });
        }

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user.id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        }).populate('users', '-password').populate('latestMessage');

        isChat = await Chat.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'firstName lastName email profileImage',
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user.id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
            res.status(200).json(FullChat);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Private
exports.fetchChats = async (req, res, next) => {
    try {
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        results = await Chat.populate(results, {
            path: 'latestMessage.sender',
            select: 'firstName lastName email profileImage',
        });

        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

// @desc    Create New Group Chat
// @route   POST /api/chat/group
// @access  Private
exports.createGroupChat = async (req, res, next) => {
    try {
        if (!req.body.users || !req.body.name) {
            return res.status(400).json({ success: false, error: 'Please Fill all the fields' });
        }

        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).json({ success: false, error: 'More than 2 users are required to form a group chat' });
        }

        users.push(req.user.id);

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user.id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).json(fullGroupChat);
    } catch (error) {
        next(error);
    }
};
