import { IIssue } from "../../components/issue-list-item";

export const mockDeveloperIssues: IIssue[] = [
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "01",
    issueId: "10",
    creatorGithub: "@BeproTeam",
    amount: 3000,
    numberOfComments: 8,
    state: "open",
    title:
      "Remove all getContract functions from Application and create new contract",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 3,
        login: "DevThree",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "02",
    issueId: "20",
    creatorGithub: "@BeproTeam",
    amount: 2000,
    numberOfComments: 2,
    state: "in progress",
    title:
      "Remove all functions from Application X-app and create new functions",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 3,
        login: "DevThree",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 4,
        login: "DevFour",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 5,
        login: "DevFive",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 6,
        login: "DevSix",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 7,
        login: "DevSeven",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "03",
    issueId: "30",
    creatorGithub: "@SkyTeam",
    amount: 1500,
    numberOfComments: 4,
    state: "ready",
    title: "Create all screens and functions for the application",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [],
    githubId: "04",
    issueId: "40",
    creatorGithub: "@SkyTeam",
    amount: 150,
    numberOfComments: 6,
    state: "draft",
    title: "Change all screens and functions for the application",
  },
];

export const mockReadyIssues: IIssue[] = [
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "01",
    issueId: "10",
    creatorGithub: "@BeproTeam",
    amount: 3000,
    numberOfComments: 8,
    state: "ready",
    title:
      "Remove all getContract functions from Application and create new contract",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 3,
        login: "DevThree",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "02",
    issueId: "20",
    creatorGithub: "@BeproTeam",
    amount: 2000,
    numberOfComments: 2,
    state: "ready",
    title:
      "Remove all functions from Application X-app and create new functions",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 3,
        login: "DevThree",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 4,
        login: "DevFour",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 5,
        login: "DevFive",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 6,
        login: "DevSix",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 7,
        login: "DevSeven",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "03",
    issueId: "30",
    creatorGithub: "@SkyTeam",
    amount: 1500,
    numberOfComments: 4,
    state: "ready",
    title: "Create all screens and functions for the application",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [
      {
        id: 1,
        login: "DevOne",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 2,
        login: "DevTwo",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 3,
        login: "DevThree",
        avatar_url: "https://img.pizza/28/28",
      },
      {
        id: 4,
        login: "DevFour",
        avatar_url: "https://img.pizza/28/28",
      },
    ],
    githubId: "04",
    issueId: "40",
    creatorGithub: "@SkyTeam",
    amount: 150,
    numberOfComments: 6,
    state: "ready",
    title: "Change all screens and functions for the application",
  },
];

export const mockNewIssues: IIssue[] = [
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [],
    githubId: "01",
    issueId: "10",
    dueDate: "7 days to expire",
    creatorGithub: "@BeproTeam",
    amount: 3000,
    numberOfComments: 8,
    state: "draft",
    title:
      "Remove all getContract functions from Application and create new contract",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [],
    githubId: "02",
    issueId: "20",
    creatorGithub: "@BeproTeam",
    dueDate: "7 days to expire",
    amount: 2000,
    numberOfComments: 2,
    state: "draft",
    title:
      "Remove all functions from Application X-app and create new functions",
  },
  {
    body: "Testing",
    createdAt: new Date("2021-07-07T21:10:59.495Z"),
    developers: [],
    githubId: "03",
    issueId: "30",
    creatorGithub: "@SkyTeam",
    dueDate: "7 days to expire",
    amount: 1500,
    numberOfComments: 4,
    state: "draft",
    title: "Create all screens and functions for the application",
  },
];