const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');

const port = process.env.PORT || config.get('PORT');

// API
const WEATHER_API = 'http://api.openweathermap.org/data/2.5';
const API_PARAMS = 'appid=68ff47157111a8220e55d70dd494f13d&units=metric';

const fetchData = (type, city) =>
  fetch(
    `${WEATHER_API}/${type}?${API_PARAMS}&q=${encodeURIComponent(city)}`
  ).then((res) => res.json());

// bot
const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET'),
});

/*
bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  console.log(`The user said: ${text}`);
});
*/

bot.hear(['hello', 'hi', 'help'], (payload, chat) => {
  chat.say(`Hi! ${helps.join('\n\n')}`, options);
});

bot.hear(/weather (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const cityName = data.match[1];
    handleWeather(conversation, cityName);
  });
});

bot.hear(/forecast (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const cityName = data.match[1];
    handleForecast(conversation, cityName);
  });
});

// common
const options = { typing: true };

const helps = [
  'If you would like to know what is the weather like now, tell me "weather" and the name of the city.',
  'If you would like to know the weather forecast, tell me "forecast" and the name of the city.',
];

const handleCityNotFound = (conversation, cityName) => {
  conversation.say(
    `I could not find the city ${cityName}, you can try searching for another city.`,
    options
  );
  conversation.end();
};

handleFinish = (conversation) => {
  conversation.say('OK, you can ask me for another city then.', options);
  conversation.end();
};

const transformWeatherData = (data) => [
  `condition: ${data.weather[0].description}`,
  `temperature: ${data.main.temp} °C`,
  `pressure: ${data.main.pressure} hPa`,
  `humidity: ${data.main.humidity} %`,
  `wind: ${data.wind.speed} m/s`,
  `cloudiness: ${data.clouds.all} %`,
];

// weather
const handleWeather = (conversation, cityName) => {
  fetchData('weather', cityName).then((json) => {
    if (json.cod == 200) {
      const weatherText = `- ${transformWeatherData(json).join('\n- ')}`;
      conversation
        .say(`Weather in ${json.name} (${json.sys.country}): \n${weatherText}`, options)
        .then(() =>
          conversation.ask(
            {
              text: 'Would you like to know the forecast too?',
              quickReplies: ['Yes', 'No'],
              options,
            },
            (payload, conversation) => {
              if (payload.message.text === 'Yes') {
                handleForecast(conversation, json.name);
              } else {
                handleFinish(conversation);
              }
            }
          )
        );
    } else {
      handleCityNotFound(conversation, cityName);
    }
  });
};

// forecast
const handleForecast = (conversation, cityName) => {
  fetchData('forecast', cityName).then((json) => {
    if (json.cod == 200) {
      handleDateChoice(conversation, json);
    } else {
      handleCityNotFound(conversation, cityName);
    }
  });
};

const handleDateChoice = (conversation, json) => {
  conversation.ask(
    {
      text: 'Please select the date:',
      quickReplies: [...new Set(json.list.map((item) => item.dt_txt.split(' ')[0]))],
      options,
    },
    (payload, conversation) => {
      handleTimeChoice(conversation, json, payload.message.text);
    }
  );
};

const handleTimeChoice = (conversation, json, date) => {
  const filteredItems = json.list.filter((item) => item.dt_txt.startsWith(date));
  if (filteredItems.length) {
    conversation.ask(
      {
        text: 'Please select the time:',
        quickReplies: filteredItems.map((item) => item.dt_txt.split(' ')[1]),
        options,
      },
      (payload, conversation) => {
        handleShowForecastResult(conversation, json, date, payload.message.text);
      }
    );
  } else {
    conversation
      .say('The date is not valid.', options)
      .then(() => handleDateChoice(conversation, json));
  }
};

const handleShowForecastResult = (conversation, json, date, time) => {
  const item = json.list.find((item) => item.dt_txt === `${date} ${time}`);
  if (item) {
    const forecastText = `- ${transformWeatherData(item).join('\n- ')}`;
    conversation
      .say(
        `Forecast for ${new Date(item.dt_txt).toLocaleString()} in ${json.city.name} (${
          json.city.country
        }): \n${forecastText}`,
        options
      )
      .then(() =>
        conversation.ask(
          {
            text: 'Would you like to know the forecast for different date/time?',
            quickReplies: ['Yes', 'No'],
            options,
          },
          (payload, conversation) => {
            if (payload.message.text === 'Yes') {
              handleDateChoice(conversation, json);
            } else {
              handleFinish(conversation);
            }
          }
        )
      );
  } else {
    conversation
      .say('The time is not valid.', options)
      .then(() => handleTimeChoice(conversation, json, date));
  }
};

// start
bot.start(port);
