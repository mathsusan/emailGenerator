#Email Creator

I was looking for a way to create html email for a project where I could easily change the words without hunting through all that mess of html.  The gulp process replaces placeholder text with the text from email_text/emailText.json.  The first entry in this file is the name of the email template being used.  

## Getting Started

Clone or download this repo and use it to generate your email.
``` 
npm install
gulp serve
```

## Using the email template
The words for the email go in email_text/emailText.json
The generated html will be in build/index.html
Use Litmus or some other email testing software to test the email.

## Authors

* **Susan McKenzie** - *Initial work* - [mathSusan](https://github.com/mathsusan)

