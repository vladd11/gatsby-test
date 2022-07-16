import {graphql, navigate, PageProps, useStaticQuery} from "gatsby";
import {useEffect, useState} from "react";
import Api from "../../api/api";

import OrderCompleteComponent from "../../components/order/OrderCompleteComponent";

import Data from "../../interfaces/data";
import OrderResponse from "../../interfaces/order";

type OrderCompleteProps = PageProps & {
    location: {
        state: OrderResponse
    }
}

// noinspection JSUnusedGlobalSymbols
export default function Complete(props: OrderCompleteProps) {
    const data: Data = useStaticQuery(graphql`
        {
            allFile {
                edges {
                    node {
                        relativePath
                        childImageSharp {
                            gatsbyImageData(width: 200)
                        }
                    }
                }
            }
            site {
                siteMetadata {
                    title
                    description
                    phone

                    address
                    addressLink
                }
            }
        }`)

    const [orderResponse, setOrderResponse] = useState<OrderResponse>(props.location.state);

    const api = new Api();
    useEffect(() => {
        if (!orderResponse) {
            const params = new URLSearchParams(location.search);
            const orderID = params.get("orderID");

            if (!orderID) {
                // It's redirect
                // noinspection JSIgnoredPromiseFromCall
                navigate("/404")
            } else {
                api.getOrder(orderID).then((result) => {
                    if (!result) {
                        // It's redirect
                        // noinspection JSIgnoredPromiseFromCall
                        navigate("/404");
                        return
                    }

                    setOrderResponse(result)
                })
            }
        }
    }, [])

    return OrderCompleteComponent({
        info: data.site.siteMetadata,
        order: orderResponse,
        allFile: data.allFile,
        api: api
    })
}
