
export interface newsData {
    source: {
        id: string,
        name: string
    }
    author: string,
    title: string,
    description: string,
    url: string,
    urlToImage: string,
    publishedAt: string,
    content: string
}

export interface newsAPIResponse {
    status: string,
    totalResults: number,
    articles: newsData[]
}

export interface uniqueSourceIndices {
    [sourceName: string]: number[]
}


