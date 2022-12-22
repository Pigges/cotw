async function API(method, params) {
    return await fetch("http://localhost:5279/", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            method,
            params
        })
    })
}

async function getCOTW(claims) {
    let cotw = [];
    for (let i in claims) {
        const claim = claims[i];

        const name = claim.name.toLowerCase();
        if (!name.includes('cotw')) continue;

        const week = name.split('cotw')[1];
        const channel_name = "@" + claim.value.title.split('- @')[1];

        if (!week) continue;

        let thumbnail = "#";

        if (claim.value && claim.value.thumbnail) {
            thumbnail = claim.value.thumbnail.url;
        }

        // console.log(channel);

        const creator = {
            week: week,
            creator: channel_name,
            thumbnail: thumbnail,
            url: claim.permanent_url
        }
        cotw.push(creator);
    }
    return cotw;
}

async function getChannelClaims() {
    let page = 0;
    let claims = [];
    while (true) {
        const claim = await (await API('claim_search', {
            channel: "@cc:c4",
            page_size: 50,
            page: page+1
        })).json();
        page = claim.result.page;

        claims = claims.concat(await getCOTW(claim.result.items));

        if (page == claim.result.total_pages) break;
    }

    claims.sort((a, b) => (parseInt(a.week) > parseInt(b.week)) ? 1 : -1)
    return claims;
}

Bun.serve({
    async fetch(req) {
        port: process.env.PORT || 3000;
        
        const claims = await getChannelClaims();
        return new Response(JSON.stringify(claims))
    }
})