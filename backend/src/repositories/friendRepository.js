const Friend = require('../models/Friend')

class FriendRepository {
  async findFriends(userObjectId) {
    return Friend.find({
      $or: [
        { requester: userObjectId, status: 'accepted' },
        { recipient: userObjectId, status: 'accepted' }
      ]
    })
    .populate('requester', 'id name email country avatar')
    .populate('recipient', 'id name email country avatar')
  }

  async findPendingRequests(userObjectId) {
    return Friend.find({
      recipient: userObjectId,
      status: 'pending'
    }).populate('requester', 'id name email country avatar')
  }

  async findFriendship(user1Id, user2Id, status = 'accepted') {
    return Friend.findOne({
      $or: [
        { requester: user1Id, recipient: user2Id, status },
        { requester: user2Id, recipient: user1Id, status }
      ]
    })
  }

  async findRequest(requesterId, recipientId, status = 'pending') {
    return Friend.findOne({
      requester: requesterId,
      recipient: recipientId,
      status
    })
  }

  async findById(requestId) {
    return Friend.findById(requestId)
  }

  async findByIdAndRecipient(requestId, recipientId) {
    return Friend.findOne({
      _id: requestId,
      recipient: recipientId,
      status: 'pending'
    })
  }

  async create(data) {
    const friendRequest = new Friend(data)
    return friendRequest.save()
  }

  async deleteById(id) {
    return Friend.deleteOne({ _id: id })
  }
}

module.exports = new FriendRepository()
