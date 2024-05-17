Query for this API output was:

https://newsapi.org/v2/everything?q=Israel-Gaza&domains=washingtonpost.com&sortBy=relevancy&apiKey=5575fc7844b2407cb552962391f7368f

We only included 'washingtonpost.com' as the news source for the 'domains' query and
we received 60 articles, even though we got no articles from 'washingtonpost.com' with the
query in Case 1!

This is a common issue with the API-- some sources like CNN and Vox for some reason tend to
dominate the API output even if there are many stries from other stories such as The
Washington Post.

This is the reason why for a given trending topic, we make an API call for EACH potential source
rather than grouping all sources into one API call.
