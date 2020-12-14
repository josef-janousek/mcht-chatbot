# UCL MCHT Chatbot

The chatbot can search and display current weather and weather forecast for given city using [OpenWeather](https://openweathermap.org/api) API.

## Current weather

Question format: `weather <city_name>`

> for example: `weather London`

Information for given city is fetched from [Current weather data](https://openweathermap.org/current) API.

When the city is found:

1. Chatbot replies with this data for the city:
   - weather condition
   - temperature
   - pressure
   - humidity
   - wind speed
   - cloudiness
2. Then it asks the user whether he wants to know the forecast too (with quick replies: `Yes` and `No`).
   1. When the user answers `Yes`, it continues to the forecast (see below).
   2. Otherwise the conversation is finished.

Otherwise it informs that the city was not found.

## Weather forecast

Question format: `forecast <city_name>`

> for example: `forecast London`

Information for given city is fetched from [5 day weather forecast](https://openweathermap.org/forecast5) API.

When the city is found:

1. Chatbot asks the user for selecting desired date for forecast (with quick replies for the next 5 days).
   - If the answer for selected date is not valid, it shows warning and offers another selection of date.
2. Chatbot asks the user for selecting desired time for forecast (with quick replies for the 3-hour steps inside selected date).
   - If the answer for selected time is not valid, it shows warning and offers another selection of time.
3. Chatbot replies with this data for the city (forecast for selected date and time):
   - weather condition
   - temperature
   - pressure
   - humidity
   - wind speed
   - cloudiness
4. Then it asks the user whether he wants to know the forecast for different date/time (with quick replies: `Yes` and `No`).
   1. When the user answers `Yes`, it offers another selection of date.
   2. Otherwise the conversation is finished.

Otherwise it informs that the city was not found.

## Help

When the user writes `hello`, `hi` or `help`, the chatbot replies with greeting and description of possible question formats.
