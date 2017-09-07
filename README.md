#Email Creator

I was looking for a way to create html email for a project where I could easily change the words without hunting through all that mess of html.  The gulp process replaces placeholder text with the text from your text files found in the email_text directory.   The first entry in this file is the name of the resulting email file.  The second entry in the file is the name of the email template being used (without the extension).  

## Getting Started

Clone or download this repo and use it to generate your email.
``` 
npm install
```

## Using the project
Put your htmlTemplates in the htmlemailTemplates directory
Put your text version of the templates in the textTemplates directory

The words for your emails should be in .json files found in the email_text directory (you can have subdirectories under this to keep different types of emails separate)

When working on one email you can use
```
gulp serveone --textfile <path to text file - don't include the email_text>
```
For example, 
```
gulp serveone --textfile adminEmails/new-order-ready.json 
```

To generate all the emails you have stored in the proejct 
```
gulp create-all-emails
```
The results can be found in the build folder.

Alwyas use Litmus or some other email testing software to test the email.

## Author

* **Susan McKenzie** - *Initial work* - [mathSusan](https://github.com/mathsusan)

