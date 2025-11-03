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
