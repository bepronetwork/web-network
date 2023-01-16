export const rssTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>{{appTitle}}</title>
        <link>{{appLink}}</link>
        <language>en-us</language>
        <description>{{appDescription}}</description>
        {{#each bounties}}
        <item>
            <title style="text-transform: capitalize;">{{title}}</title>
            <description>
                <![CDATA[ 
                    <div>
                        <img src="{{seoUrl}}" style="width: 100%;" />
                        <div style="text-transform: capitalize;">{{description}}</div>
                        <div>
                            {{#each tags}}
                                <span style="color: white; background-color: #4250e4; font-weight: bold; text-transform: uppercase; border-radius: 8px; border: 1px; solid #4250e4; padding: 2px 3px; margin-right: 2px;">
                                    #{{tag}}
                                </span>
                            {{/each}}
                        </div>
                    </div> 
                ]]>
            </description>
            <link>{{link}}</link>
            <pubDate>{{creationDate}}</pubDate>
            <guid>{{link}}</guid>
        </item>
        {{/each}}
    </channel>
</rss>
`;