import buildClient from '../api/build-client';


const HomePage = ({ currentUser }) => {
  return currentUser ?
  <h1>You are signed in</h1>
  :
  <h1>Not signed in</h1>
};

HomePage.getInitialProps = async (context) => {
  //doesn't get called from here when there is a getInitialProps in _app.js.
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
}


export default HomePage;