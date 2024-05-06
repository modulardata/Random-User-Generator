import path from 'path';
import {correct, StageTest, wrong} from 'hs-test-web';

const pagePath = path.join(import.meta.url, '../../src/index.html');

class Test extends StageTest {

    page = this.getPage(pagePath)

    tests = [this.page.execute(() => {
        // test #1
        // HELPERS-->

        // check keys
        this.checkKeys = (obj= {}, key= "") => {
            return !(key in obj);
        };


        // CONSTANTS-->
        this.resultsKeys = ['gender', 'name', 'location',
            'email', 'login', 'dob', 'registered', 'phone',
            'cell', 'id', 'picture', 'nat'];
        this.infoKeys = ['seed', 'results', 'page', 'version'];
        // <--CONSTANTS

        // MESSAGES-->
        this.missingObjKeyMsg = (key) => {
            return `The JSON response object in the body of the HTML does not have the key "${key}".`;
        };
        this.missingInnerObjKeyMsg = (key, innerObj="results") => {
            return `The "${innerObj}" object in the JSON response object in the body of the HTML does not have the key "${key}".`;
        }
        // <--MESSAGES
        return correct();

    }),
        this.node.execute(async () => {
            // test #2
            // set timeout to wait for the page to load

            await new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 3000)
            }));

            return correct();
        }),

        this.page.execute(() => {
            // test #3
            // check api call
            const api = "https://randomuser.me/api";
            const entries = performance.getEntriesByType("resource");
            const entry = entries.find(entry => entry.name.includes(api));
            if (!entry) return wrong("The correct API call is missing.");

            // check if no element other than script exists in body
            if (document.body.children.length > 1 && document.body.children[0].nodeName.toLowerCase() !== "script")
                return wrong("There shouldn't be anything else except the fetched data in the body of the HTML.");

            // check body has the right keys
            const body = document.body.innerText;
            let bodyJson;
            try {
                bodyJson = JSON.parse(body);
            } catch (e) {
                return wrong("The body of the HTML does not contain a valid JSON object to parse.");
            }

            // results
            if (this.checkKeys(bodyJson, "results"))
                return wrong(this.missingObjKeyMsg("results"));

            // info
            if (this.checkKeys(bodyJson, "info"))
                return wrong(this.missingObjKeyMsg("info"));

            // check results has the right keys
            const results = bodyJson?.results[0];

            for (const key of this.resultsKeys) {
                if (this.checkKeys(results, key))
                    return wrong(this.missingInnerObjKeyMsg(key, "results"));
            }

            // check info has the right keys
            const info = bodyJson?.info;

            for (const key of this.infoKeys) {
                if (this.checkKeys(info, key))
                    return wrong(this.missingInnerObjKeyMsg(key, "info"));
            }


            return correct();
        }),
    ]

}

it("Test stage", async () => {
    await new Test().runTests()
}).timeout(30000);