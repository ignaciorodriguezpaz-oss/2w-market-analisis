function priceFor(model){return DATA.product_planning.prices.find(p=>norm(p.model).replaceAll(" ","")===norm(model).replaceAll(" ",""))}
