require('dotenv').config();
const axios = require('axios');

const getAllUsers = async (tweet) => {
  const data = [];
  const value = {};
  const call_count = {
    count: 0,
    message: 'Total GET requests made (GET /2/tweets/:id/liking_users)'
  };

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
    call_count.count++;

    return await res.data
  }

  try {
    let paginate;
    const initialData = await getUsers(tweet);
    data.push(...initialData.data);

    if (initialData.meta.next_token) {
      paginate = initialData.meta.next_token;
    }

    while (paginate) {
      const nextData = await getUsers(tweet, paginate);

      if (nextData.data) {
        data.push(...nextData.data);
      }

      if (nextData.meta.next_token) {
        paginate = nextData.meta.next_token;
      } else {
        paginate = null;
      }

      if (call_count.count >= 50) {
        break;
      }
    }

    data.sort((a, b) => (a.public_metrics.followers_count < b.public_metrics.followers_count ? 1 : -1));
    value.data = data;

    value.call_count = call_count;

    if (call_count.count >= 50) {
      call_count.message.concat(`\nNot all accounts found. I limited to 50 max GET requests total.`);
    }

  } catch (err) {
    const error = {};
    error.statusCode = err.response.status;
    error.statusText = err.response.statusText;
    error.title = err.response.data.title;
    error.detail = err.response.data.detail;
    value.error = error;

    call_count.message.concat(`\nRate Limits at 75 calls every 15 minutes. See Docs.`);
    value.call_count = call_count;
  }

  return value
}

// Test Below
getAllUsers('1489127743115563008')
  .then(res => {
    console.log(res)
  })