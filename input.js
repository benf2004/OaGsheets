async function main() {
    async function keepa(asin, d_id) {
        let response = await fetch("https://api.keepa.com/product?key=" + jumbo + "&domain=" + d_id + "&asin=" + asin + "&stats=0")
        return response.json()
    }

    async function get_cats(id, d_id){
        let response1 = await fetch("https://api.keepa.com/category?key=" + jumbo + "&domain=" + d_id + "&category=" + id)
        let my_data = await response1.json()
        console.log(my_data)
        let category = my_data['categories'][id]
        return category
    }


    function detrmRefPer(price, cats2) {
        const eightPer = [
            'Camera & Photo', 'Full-Size Appliances', "Cell Phone Devices",
            "Consumer Electronics", "Personal Computers", "Video Game Consoles"
        ];
        const groceryFee = ["Grocery & Gourmet Foods"];
        const twelvePer = ["3D Printed Products", "Automotive & Powersports", "Industrial & Scientific", "Food Service", "Janitorial & Scientific"];
        const specialFee = [
            "Electronics Accessories", "Furniture", "Compact Appliances",
            "Collectible Coins"
        ];
        const switch10 = ["Baby", "Beauty", "Health & Personal Care"];
        const fifteenPer = [
            "Books",
            "Industrial & Scientific",
            "Home & Garden",
            "Kitchen & Dining",
            "Mattresses",
            "Music",
            "Musical Instruments",
            "Office Prodcuts",
            "Outdoors",
            "Pet Supplies",
            "Software & Computer",
            "Video Games",
            "Sports",
            "Tools & Home Improvement",
            "Toys & Games",
            "Video & DVD",
            "Cell Phones & Accessories",
            "Everything Else",
            "Luggage & Travel Accessories",
            "Shoes, Handbags & Sunglasses",
        ];
        var refPer = 0.15
        for (let each in cats2) {
            var catName = cats2[each]["name"]
            console.log("CATEGORY NAME IS: " + catName)
            for (let each1 in twelvePer) {
                if (catName == twelvePer[each1]) {
                    refPer = .12
                }
            }

            for (let each1 in fifteenPer) {
                if (catName == fifteenPer[each1]) {
                    refPer = .15
                }

            }
            for (let each1 in eightPer) {
                if (catName == eightPer[each1]) {
                    refPer = .12
                }
            }
            for (let each1 in switch10) {
                if (catName == eightPer[each1]) {
                    if (price < 10) {
                        refPer = 0.8
                    }
                    if (price >= 10) {
                        refPer = .15
                    }
                }
            }
        }
        return refPer
    } // end of determine refferal percentage function

    function round_2(num){
        return (Math.round(num * 100) / 100).toFixed(2);
    }

// updates necessary stats
    function updateStats() {
        //TODO: Determine what other stats to show (sales rank etc)
        console.log("updating")

        // vars from docuent
        let price = Number(document.getElementById("price").value)
        let cogs = Number(document.getElementById("cogs").value)
        let ship = Number(document.getElementById("ship").value)
        let other = Number(document.getElementById("other").value)

        // vars from keepa
        const stats = object1['products'][0]['stats']['current'];
        let drop30 = object1['products'][0]['stats']['salesRankDrops30']
        let drop90 = object1['products'][0]['stats']['salesRankDrops90']
        let drop180 = object1['products'][0]['stats']['salesRankDrops180']
        let drops = drop30 + "|" + drop90 + "|" + drop180
        let sales_rank = stats[3];
        let refFee = round_2(price * refPer)
        let totFees = round_2(+refFee + ship + other)
        let profit = round_2(price - totFees - cogs)
        let margin = round_2(profit * 100 / price)
        let roi1 = round_2(profit * 100 / cogs)
        let top_per = ((sales_rank / highest) * 100).toFixed(3)
        document.getElementById("asin").innerHTML = asin
        document.getElementById("profit").innerHTML = profit;
        document.getElementById("ref_fee").innerHTML = refFee;
        document.getElementById("total").innerHTML = totFees;
        document.getElementById("roi").innerHTML = roi1 + "%";
        document.getElementById("margin").innerHTML = margin + "%";
        document.getElementById("sr").innerHTML = sales_rank;
        document.getElementById("category").innerHTML = cat_name;
        document.getElementById("top").innerHTML = top_per + "%";
        document.getElementById("drops").innerHTML = drops
        return [price, cogs, ship, other, stats, drop30, drop90, drop180, drops, sales_rank, refFee, totFees, profit, margin, roi1, top_per]
    } // end update stats

// sets asin and fileID vars from URL
    const jumbo = "bcttbfvkurmk8mqm5hdo5fvdvarqiibhpehs2pshpe535fpkov2u8b107me6q79m";
    let url = window.location.search
    const urlParams = new URLSearchParams(url);
    const asin = decodeURI(urlParams.get("asin"))
    const fileID = decodeURI(urlParams.get("fileID"))
    const is_dynam = decodeURI(urlParams.get('dy'))
    const domain = decodeURI(urlParams.get("d_id"))
    let order = urlParams.get("o")

    const object1 = await keepa(asin, domain);
    const product = await object1['products'][0];
    var title = product['title'];
    let pickPack = await product["fbaFees"]['pickAndPackFee'] / 100;
    let root_cat_id = await product['rootCategory']
    const cats = await get_cats(root_cat_id, domain);
    let cat_name = await cats['name'];
    let highest = await cats['highestRank']
    const currentStats = await object1['products'][0]['stats']['current'];
    let price = await currentStats[1] / 100;
    let cats2 = await product["categoryTree"]
    const refPer = detrmRefPer(price, cats2)
    document.getElementById("price").value = price;
    document.getElementById("ship").value = pickPack;
    updateStats()

    async function sendInfo() {
        let stats = updateStats()
        console.log("SENDING")
        document.getElementById("icon").className = "fas fa-spinner fa-spin"
        setTimeout(() => {document.getElementById("icon").className = "fa-brands fa-google-drive"}, 2000)
        console.log('File ID: ' + fileID);
        let price = Number(document.getElementById("price").value)
        let cogs = Number(document.getElementById("cogs").value)
        let ship = Number(document.getElementById("ship").value)
        let other = Number(document.getElementById("other").value)
        let sourceURL = document.getElementById("source").value
        let notes = encodeURIComponent(document.getElementById("notes").value)
        let enc_title = encodeURIComponent(title)
        let enc_cat = encodeURIComponent(cat_name)
        console.log("ref per is(extension) : " + refPer)
        let refURL = "https://oa2gsheets.com/send.html?asin=" + asin + "&dy=" + is_dynam + "&top=" + stats[15] + "&drops=" + stats[8] + "&title=" + enc_title + "&cat=" + enc_cat + "&r=" + stats[9] + "&s=" + ship + "&other=" + other + "&fileID=" + fileID + "&o=" + order + "&cogs=" + cogs + "&sourceurl=" + sourceURL + "&refPer=" + refPer + "&notes=" + notes + "&price=" + price;
        let codeURL = encodeURI(refURL)
        console.log("code URL: " + codeURL)
        document.getElementById("frame").src = codeURL
    }

    document.getElementById("price").addEventListener("input", updateStats);
    document.getElementById("other").addEventListener("input", updateStats);
    document.getElementById("cogs").addEventListener("input", updateStats);
    document.getElementById("notes").addEventListener("input", updateStats);
    document.getElementById("send").addEventListener("click", sendInfo);
}
main()

