# totallynormalnotes
 A very normal notes app, totally isnt filled with jumpscares or messes with your writing, totally.
# Features
## Filtering notes:
Type in the search bar to search title and content
**OR:**
prefix a query with `:js:` to run it through a filter.
Avaliable keys are:
- title
- content
- createdate (unix timestamp)
- tags (array)
- path (array)
### Example:
Find all notes where title matches the body content:
`:js:i.title == i.content`

Your queries are executed like this:
```javascript
result = eval(`notes.filter(i=>(`+query+"))")
```
For JS queries you must press enter to execute

# Markdown Testing
Use this to test the parser.
If you press two newlines consecutively it makes a new paragraph.
```md
# Markdown Test
## Heading Two
### Heading Three
#### Heading Four
##### Heading Five
###### Heading Six
*italic* **bold** _italic_ __bold__
> Blockquote 
`inline code`
```
codeblock
```
***italic bold***
___italic bold___
*`code`*
**`code`**
***`test`***
___`test`___

![Test of Image](https://files.novafurry.win/1.%20Images/PleaseCarefullyExamineTheKDE%20%f0%9f%91%8d/PleaseCarefullyExamineTheKDE%20%f0%9f%91%8d.png)
[google.com](http://google.com)
```

totally normal notes is made with pride & gayness 🏳️‍⚧️ 🏳️‍🌈
