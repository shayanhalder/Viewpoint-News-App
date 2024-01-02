import g4f
from flask import Flask, request, jsonify 
from dotenv import load_dotenv
import os

app = Flask(__name__)

@app.route("/", methods=['GET'])
def home() -> str:
    print('Home')
    return "You are at the home page"
    

@app.route("/get-analysis", methods=['POST'])
def get_analysis() -> str:
    article_info = request.json
    trending_topic = article_info['trending_topic']
    article_body = article_info['body']
    
    message = f"""

    The following is an article on {trending_topic}. I want you to read it and analyze for any potential biases 
    the author has and any techniques the author uses to convey their point. Please give this information in bullet points. 
    
    Please also provide a brief overview of the article and the author's intent. 
    Note that the article text is being retrieved from a news extractor API so it may have some formatting issues and 
    may happen to include some text that isn't part of the main article body (such as ads/promotions). 
    
    Give your response in this format:
    
    #### Overview
    (write the overview here)
    
    #### Biases
    (write any potential biases the author may have and techniques they use to convey their point here in bullet points)
    
    #### Comments
    (write any general comments you have about the article and the trending topic here.)
    
    Here is the article:
    {article_body}
    
    """
    g4f.debug.logging = True  # Enable debug logging
    g4f.debug.check_version = False  # Disable automatic version checking
    
    response = g4f.ChatCompletion.create(
        model=g4f.models.gpt_35_turbo,
        messages=[{"role": "user", "content": message}],
    )
    
    response_data = {
        "trending_topic" : article_info['trending_topic'],
        "article_body" : article_info['body'],
        "analysis": response
    }

    return jsonify(response_data)

if __name__ == "__main__":
    load_dotenv()
    PORT = os.getenv('PORT')
    app.run(debug=True, host="0.0.0.0", port=PORT)