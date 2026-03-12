const { StreamClient } = require('@stream-io/node-sdk');

const client = new StreamClient(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// @desc  Generate a Stream Video token for the current user
// @route GET /api/stream/token
// @access Private
exports.getStreamToken = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // Upsert the user on Stream side
        await client.upsertUsers([{
            id: userId,
            name: `${req.user.firstName} ${req.user.lastName}`,
            image: req.user.profileImage || undefined,
            role: 'user',
        }]);

        // Generate a token valid for 1 hour
        const token = client.generateUserToken({ user_id: userId });

        res.status(200).json({
            success: true,
            token,
            apiKey: process.env.STREAM_API_KEY,
            userId,
            userName: `${req.user.firstName} ${req.user.lastName}`,
        });
    } catch (error) {
        console.error('Stream token error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate Stream token' });
    }
};

// @desc  Create / ensure a call exists on Stream
// @route POST /api/stream/call
// @access Private
exports.createCall = async (req, res) => {
    try {
        const { callId, callType = 'default' } = req.body;
        const userId = req.user._id.toString();

        const call = client.video.call(callType, callId);
        await call.getOrCreate({
            data: {
                created_by_id: userId,
                members: [{ user_id: userId }],
            },
        });

        res.status(200).json({ success: true, callId, callType });
    } catch (error) {
        console.error('Stream create call error:', error);
        res.status(500).json({ success: false, error: 'Failed to create call' });
    }
};
