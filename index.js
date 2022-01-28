require('dotenv').config();
const axios = require('axios');

const getAllUsers = async (tweet) => {

  const data = [];
  const validData = { data: [] };
  const error = { error: {} };
  let value;
  let callCount = 0;

  const getUsers = async (tweetID, paginate = '') => {
    if (typeof tweetID === typeof 0) { tweetID = tweetID.toString() }

    const config = {
      method: 'get',
      url: `https://api.twitter.com/2/tweets/${tweetID}/liking_users?user.fields=id,name,username,verified,created_at,public_metrics&max_results=100${paginate.length > 0 ? `&pagination_token=${paginate}` : ''}`,
      headers: { 
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`, 
        'Cookie': `guest_id=${process.env.GUEST_ID}; personalization_id="${process.env.PERSONAL_ID}"`
      }
    };
    const res = await axios(config);
    callCount++;

    return await res.data
  }

  try {
    let paginate;
    const initialData = await getUsers(tweet);
    data.push(...initialData.data);

    if (initialData.meta.next_token) {
      paginate = initialData.meta.next_token
    }
    
    while (paginate) {
      const nextData = await getUsers(tweet, paginate);
  
      if (nextData.data) {
        data.push(...nextData.data);
      }
      
      if (nextData.meta.next_token) {
        paginate = nextData.meta.next_token
      } else {
        paginate = null
      }
    }
  } catch (err) {
    error.error.statusCode = err.response.status;
    error.error.statusText = err.response.statusText;
    error.error.title = err.response.data.title;
    error.error.detail = err.response.data.detail;
  }

  validData.data = data;
  value = error.error.statusCode ? error : validData

  console.log(`Total calls made: ${callCount}`)

  return value
}

// Test Below
getAllUsers('1486854100264550400')
  .then(res => {
    console.log(res)
  })