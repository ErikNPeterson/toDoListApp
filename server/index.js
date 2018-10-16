
const { GraphQLServer } = require('graphql-yoga')
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

const Todo = mongoose.model('Todo', {
  text: String,
  complete: Boolean
});

const typeDefs = `
  type Query {
    hello(name: String): String!
    todos: [Todo]
  }
  type Todo {
    id: ID!
    text: String!
    complete: Boolean!
  }
  type Mutation {
    createTodo(text: String!): Todo
    updateTodo(id: ID!, complete: Boolean!): Boolean
    removeTodo(id: ID!): Boolean
  }
`
const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    todos: () => Todo.find()
  },
  Mutation: {
    createTodo: (_, { text }) => {
      const todo = new Todo({ text, complete: false});
      // await todo.save(); did not work and then return todo so I changed the line below
      return todo.save();
    },
    updateTodo: async (_, {id, complete}) => {
      await Todo.findByIdAndUpdate(id, { complete });
      return true;
    },
    removeTodo: async (_, {id, complete}) => {
      await Todo.findByIdAndRemove(id);
      return true;
    }
  }
};

const server = new GraphQLServer({ typeDefs, resolvers })
mongoose.connection.once('open', function() {
  server.start({port:3001},() => console.log('Se rver is running on localhost:' + server.options.port))
});
