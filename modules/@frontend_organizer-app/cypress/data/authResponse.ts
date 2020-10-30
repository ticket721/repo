import { user } from './user';

export const loginResponse = {
  200: {
    user: {
      valid: true,
      address: "0xccC89C9d6A575DE9B21AE6266B26cCE0b532663e",
      role: "authenticated",
      id: "a7309752-d023-487d-86b9-2e472fc5fe65",
      locale: "en",
      type: "t721",
      email: user.email,
      username: user.username
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNobG_DqSIsInN1YiI6ImE3MzA5NzUyLWQwMjMtNDg3ZC04NmI5LTJlNDcyZmM1ZmU2NSIsImlhdCI6MTU5NDg4NTU3NSwiZXhwIjoxNTk3NDc3NTc1fQ.1po9UG38ObpH2Fygz4xxlaCzK5CORPbODmf799LACgg",
    expiration: "2020-08-15T07:46:15.378Z"
  },
  401: {
    message: "invalid_credentials",
    name: "Unauthorized",
    path: "/authentication/local/login",
    statusCode: 401,
    timestamp: "2020-07-16T08:18:27.374Z",
  },
}

export const registerResponse = {
  201: {
    user: {
      id: "293457c9-8b02-465b-be4b-1229d4f6f556",
      email: user.email,
      username: user.username,
      type:"t721",
      address: "0xc273DA3Cea27024AFa8d0aE094fDB1cB143daA51",
      device_address: null,
      role: "authenticated",
      valid: false,
      locale: "en"
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNobG_DqSBiIiwic3ViIjoiMjkzNDU3YzktOGIwMi00NjViLWJlNGItMTIyOWQ0ZjZmNTU2IiwiaWF0IjoxNTk0ODg4MTYyLCJleHAiOjE1OTc0ODAxNjJ9.Z5pT5JJGi6YD7V03Yet70v_WsoN6PCqcGmqdZR78C3c",
    expiration: "2020-08-15T08:29:22.377Z"
  },
  '409_email': {
    message: "email_already_in_use",
    name: "Conflict",
    path: "/authentication/local/register",
    statusCode: 409,
    timestamp: "2020-07-16T08:32:55.670Z",
  },
  '409_username': {
    message: "username_already_in_use",
    name: "Conflict",
    path: "/authentication/local/register",
    statusCode: 409,
    timestamp: "2020-07-16T08:32:55.670Z",
  }
}
