import { Message } from '../messages/schemas.js';
import { User } from '../authentication/schemas.js';

export async function getUsersInvolved(req, res) {
  const userId = req.params.userId;

  try {
    // Find messages where the provided user is either the sender or receiver
    const messages = await Message.find({ $or: [{ sender: userId }, { receiver: userId }] })
      .sort({ timestamp: -1 }) // Sort by most recent messages
      .populate('sender', '_id')
      .populate('receiver', '_id');

    // Create a map to store the most recent message timestamp for each user
    const userTimestamps = new Map();

    // Iterate through messages and update the map with the most recent message timestamp for each user
    messages.forEach((message) => {
      const otherUserId = message.sender._id.toString() === userId ? message.receiver._id : message.sender._id;
      const timestamp = message.timestamp;

      if (!userTimestamps.has(otherUserId.toString()) || timestamp > userTimestamps.get(otherUserId.toString())) {
        userTimestamps.set(otherUserId.toString(), timestamp);
      }
    });

    console.log(userTimestamps);

    // Sort the unique user IDs based on the most recent message timestamp
    const sortedUserIds = Array.from(userTimestamps.keys()).sort(
      (a, b) => userTimestamps.get(b) - userTimestamps.get(a),
    );

    // Filter out the user's own ID
    const filteredUserIds = sortedUserIds.filter((id) => id.toString() !== userId);

    res.json({ success: true, users: filteredUserIds });
  } catch (error) {
    console.error('Error in getUsersInvolved:', error);
    res.status(400).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function newMessage(req, res) {
  try {
    // Extract data from the request body
    const { content, senderId, receiverId } = req.body;

    // Check if sender and receiver exist
    let sender = await User.findById(senderId);
    let receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, error: 'Sender or receiver not found' });
    }

    if (senderId == receiverId) {
      return res.status(404).json({ success: false, error: 'Sender and Receiver are the same' });
    }

    // Create a new message
    const newMessage = new Message({
      content,
      sender: senderId,
      receiver: receiverId,
    });

    // Save the message to the database
    await newMessage.save();

    res.status(200).json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Internal Server Error' });
  }
}

export async function getMessages(req, res) {
  try {
    const { user1Id, user2Id } = req.params;

    // Find all messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
      ],
    }).sort({ timestamp: -1 }); // Sort by timestamp in ascending order

    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: 'Internal Server Error' });
  }
}
