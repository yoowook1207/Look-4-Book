const { User, bookSchema } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
            const userData = await User.findOne({_id: context.user._id})
              .select('-__v -password')
              .populate('savedBooks')

            return userData;
          }
          throw new AuthenticationError('Not logged in')
        },
        user: async (parent, { username }) => {
            return User.findOne({ username })
              .select('-__v -password')
              .populate('savedBooks')
        },

    },
    Mutation :{
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
    
            return { token, user };
        },
        login: async (parent, { email, password }) =>{
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updateSavedBook = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: args } },
                    { new: true, runValidators: true }
                ).populate('savedBooks');

                return updateSavedBook
            }
            throw new AuthenticationError('Please log in first!');

        },
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updateSavedBook = await User.findOneAndUpdate(
                    { _id: user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );

                return updateSavedBook
            }
            throw new AuthenticationError('Please log in first!');

        }
    }
}

module.exports = resolvers;