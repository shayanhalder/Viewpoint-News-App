Query for this API output was:

https://newsapi.org/v2/everything?q=Israel-Gaza&domains=cnn.com,washingtonpost.com,nytimes.com,huffpost.com,vox.com,msnbc.com,buzzfeed.com&sortBy=relevancy&apiKey=5575fc7844b2407cb552962391f7368f

If you take a look at the API output, you will see that the majority is overwhelmingly dominated by
CNN and Vox news, with only one or two occurences of other news sources that I specified in the
domains parameter.

This is a common pattern among the News API when searching for current news on a given topic, and this makes
it hard to maximize news diversity when many of these API requests will not even include any news stories
from some of the specified sources.

This is why when requesting current news data from the API, we make multiple API requests with only
one news source in each request, to get a better chance of getting news stories from sources that
would not be represented had we included all the news sources in one singular request.
