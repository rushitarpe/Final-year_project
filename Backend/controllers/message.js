// @desc    Send new message
// @route   POST /api/messages
// @access  Private
const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.sendMessage = async (req, res, next) => {
    try {
        const { content, chatId, fileUrl } = req.body;

        if (!content && !fileUrl) {
            return res.status(400).json({ success: false, error: 'Invalid data passed into request' });
        }

        var newMessage = {
            sender: req.user.id,
            content: content,
            chat: chatId,
            fileUrl: fileUrl,
        };

        let message = await Message.create(newMessage);

        message = await message.populate('sender', 'firstName lastName profileImage');
        message = await message.populate('chat');
        message = await message.populate({
            path: 'chat.users',
            select: 'firstName lastName profileImage email',
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
exports.allMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'firstName lastName profileImage email')
            .populate('chat');
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Make sure user owns the message
        if (message.sender.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this message' });
        }

        await Message.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
