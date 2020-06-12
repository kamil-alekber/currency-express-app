import {
  GraphQLSchema,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
} from "graphql";
import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

const books = [
  { name: "Name of the Wind", genre: "Fantasy", id: "1", authorId: "1" },
  { name: "The Final Empire", genre: "Fantasy", id: "2", authorId: "2" },
  { name: "The Hero of Ages", genre: "Fantasy", id: "4", authorId: "2" },
  { name: "The Long Earth", genre: "Sci-Fi", id: "3", authorId: "3" },
  { name: "The Colour of Magic", genre: "Fantasy", id: "5", authorId: "3" },
  { name: "The Light Fantastic", genre: "Fantasy", id: "6", authorId: "3" },
];

const authors = [
  { name: "Patrick Rothfuss", age: 44, id: "1" },
  { name: "Brandon Sanderson", age: 42, id: "2" },
  { name: "Terry Pratchett", age: 66, id: "3" },
];

const AuthorType = new GraphQLObjectType({
  name: "AuthorObjectType",
  fields: {
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    id: { type: GraphQLID },
  },
});

const Book = new GraphQLObjectType({
  name: "Book",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent) {
        return authors.find((author) => author.id === parent.authorId);
      },
    },
  },
});

const Author = new GraphQLObjectType({
  name: "Author",
  fields: {
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    id: { type: GraphQLID },
    books: {
      type: new GraphQLList(Book),
      resolve(parent) {
        console.log("running books leaf inside author type");
        return books.filter((book) => book.authorId === parent.id);
      },
    },
  },
});

const query = new GraphQLObjectType({
  name: "Corp",
  fields: {
    book: {
      type: Book,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(_, args) {
        console.log(typeof args.id);
        return books.find((book) => book.id === args.id);
      },
    },
    author: {
      type: Author,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(_, args) {
        return authors.find((author) => author.id === args.id);
      },
    },
    books: {
      type: new GraphQLList(Book),
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(Author),
      resolve: () => authors,
    },
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(_, args) {
        let author = {
          name: args.name,
          age: args.age,
          id: `${Math.random()}`,
        };
        authors.push(author);
        return author;
      },
    },
    addBook: {
      type: Book,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(_, args) {
        let book = {
          name: args.name,
          genre: args.genre,
          authorId: args.authorId,
          id: `${Math.random()}`,
        };
        books.push(book);
        return book;
      },
    },
    addChannel: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        topicName: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const newTopic = args.topicName;
        pubsub.publish("new_topic", { newTopic });
        return newTopic;
      },
    },
  },
});

const subscription = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    channelAdded: {
      type: new GraphQLObjectType({
        name: "ChannelAddedPayload",
        fields: { newTopic: { type: new GraphQLNonNull(GraphQLString) } },
      }),
      subscribe: () => pubsub.asyncIterator("new_topic"),
      resolve: (payload) => {
        console.log("\x1b[32m%s\x1b[0m", "[WS] resolving with", payload);
        return payload;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query,
  mutation,
  subscription,
});

export { schema };
