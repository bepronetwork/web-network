export const rssTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>{{appTitle}}</title>
        <link>{{appLink}}</link>
        <language>en-us</language>
        <description>{{appDescription}}</description>
        {{#each bounties}}
        <item>
            <title>{{title}}</title>
            <description>
                <![CDATA[ <div><img src="{{seoUrl}}" style="width: 500px;" /><div>{{title}}</div></div> ]]>
            </description>
            <link>{{link}}</link>
            <pubDate>{{creationDate}}</pubDate>
            <guid>{{link}}</guid>
        </item>
        {{/each}}
    </channel>
</rss>
`;