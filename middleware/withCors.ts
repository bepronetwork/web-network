import Cors from 'cors'


const cors = Cors({
  methods: ['GET', 'PUT', 'POST'],
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

const withCors = (handler) => {
  return async (req, res) => {
    runMiddleware(req, res, cors)
    .then(()=>{
      return handler(req, res);
    }).catch(()=>{
      return res.status(401).write('Unautorized');
    })
    
  };
};

export default withCors;
