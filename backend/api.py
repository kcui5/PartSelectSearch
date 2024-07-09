from modal import App, Image, web_endpoint, Secret

app = App("partselectsearch")

image = (
    Image.debian_slim()
    .pip_install("elasticsearch")
)

async def search_query(client, query):
    print("Querying search")
    search_query = {
        'query': {
            'function_score': {
                'query': {
                    'bool': {
                    'should': [
                        {
                            'prefix': {
                                'ModelNum': {
                                    'value': query
                                }
                            }   
                        },
                        {
                            'prefix': {
                                'PartNum': {
                                    'value': query
                                }
                            }
                        },
                        {
                            'fuzzy': {
                                'BrandName': {
                                    'value': query,
                                    'fuzziness': 'AUTO'
                                }
                            }
                        },
                        {
                            'fuzzy': {
                                'Description': {
                                    'value': query,
                                    'fuzziness': 'AUTO'
                                }
                            }
                        }
                    ]
                    },
                },
                'functions': [
                    {
                        'filter': { 'prefix': { 'ModelNum': query } },
                        'weight': 3.0
                    },
                    {
                        'filter': { 'prefix': { 'PartNum': query } },
                        'weight': 5.0
                    },
                    {
                        'filter': { 'fuzzy': { 'BrandName': { 'value': query, 'fuzziness': 'AUTO' } } },
                        'weight': 2.0
                    },
                    {
                        'filter': { 'fuzzy': { 'Description': { 'value': query, 'fuzziness': 'AUTO' } } },
                        'weight': 1.0
                    }
                ],
                'score_mode': 'sum',
                'boost_mode': 'multiply'
            }
        }
    }

    res = client.search(index="partselectmodelsextra", body=search_query)
    documents = [hit['_source'] for hit in res['hits']['hits']]

    # Print the extracted documents
    return_docs = []
    for doc in documents:
        # print(doc)
        part_num = doc["PartNum"]
        model_num = doc["ModelNum"]
        desc = doc["Description"]
        brand_name = doc["BrandName"]
        return_docs.append(f"{brand_name}END{part_num}END{model_num}END{desc}")
    print(return_docs)
    return return_docs

async def part_type_query(client, query):
    print("Querying part type")
    part_type_query = {
        'size': 0,
        'query': {
            'fuzzy': {
                'BrandName': {
                    'value': query,
                    'fuzziness': 'AUTO'
                }
            }
        },
        'aggs': {
            'unique_values': {
                'terms': {
                    'field': 'ModelGroup',
                    'size': 10 
                }
            }
        }
    }

    response = client.search(index="partselectmodelsextra", body=part_type_query)

    # Extract the unique values
    unique_values = [bucket['key'] for bucket in response['aggregations']['unique_values']['buckets']]
    print(unique_values)
    return unique_values

@app.function(image=image, secrets=[Secret.from_name("elasticsearch_api_key")])
@web_endpoint(method="POST")
def home(req: dict):
    import os
    import asyncio
    from elasticsearch import Elasticsearch

    client = Elasticsearch(
    "https://4b0cc1c77f9047359d7276555010815c.us-east4.gcp.elastic-cloud.com:443",
    api_key=os.environ["elasticsearch_api_key"])

    query = req["query"]
    print("Received:", query)

    return_docs = None
    unique_values = None

    async def qu():
        nonlocal return_docs
        nonlocal unique_values
        task1 = asyncio.create_task(search_query(client, query))
        task2 = asyncio.create_task(part_type_query(client, query))

        return_docs, unique_values = await asyncio.gather(task1, task2)

    asyncio.run(qu())
    return {"parts": return_docs[:10], "types": unique_values[:10], "brandName": query}  