# API Specification
## Table of contents
* [Overview](#heading-overview)
  * [Error Response](#heading-overview-error-response)
* [Image](#heading-image)
  * [GET /](#heading-image-get)

<h2 id="heading-overview">Overview</h2>
<h3 id="heading-overview-error-response">Error Response</h3>

Error response is conforming to [RFC 7807](https://tools.ietf.org/html/rfc7807).

<h2 id="heading-image">Image</h2>
<h3 id="heading-image-get">GET /</h3>

#### Request
##### URL
<table>
<tr><th>parameter</th><th>type</th><th>format</th></tr>
<tr><td>url</td><td>string | null	</td><td></td></tr>
<tr><td>width</td><td>number | null	</td><td></td></tr>
<tr><td>height</td><td>number | null	</td><td></td></tr>
</table>

#### Response
##### Code
|code|condition|
|---|---|
|200|Success|
|400|Invalid request|
|500|Fail|
