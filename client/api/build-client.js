import axios from 'axios';

const buildClient = ({req}) => {
  if (typeof window === 'undefined') {
    // We are on server. So reqs should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    })
  } else {
    // we are on browser. Reqs can be made with a base url of ''.
    return axios.create({
      baseURL: '/'
    })
  }
}

export default buildClient;