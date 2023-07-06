import logger from "../../logger/index.js";
import axios from 'axios';
import protocolAPI from "@metacall/protocol/protocol";
import { Plans } from "@metacall/protocol/plan";
import FormData from "form-data";
import { metacallBaseUrl } from "../../../constants/URLs.js";
export const createPackage = async (req, res) => {
    try {
        const blob = req.file;
        const jsons = req.body.jsons;
        const runners = req.body.runners;
        const name = req.body.id;
        const type = req.body.type;
        const token = process.env2.METACALL_TOKEN;
        const fd = new FormData();
        const metacallAPI = protocolAPI(token, process.env2.METACALL_FAAS_BASE_URL);
        const response_data = await metacallAPI.upload(name, blob.buffer, jsons, runners, type);
        res.json({
            message: "package created successfully",
            response_data
        });
    }
    catch (err) {
        const error = err;
        logger.error(error);
        res.status(500).json({
            message: "failed to create package"
        });
    }
};
export const deploy = async (req, res) => {
    try {
        const name = req.body.name;
        // const env = req.body.env as Array<{name: string , value : string}> ?? [];
        const env = [];
        const plan = Plans.Standard;
        const resourceType = "Package";
        // const token = req.session.token //TODO: add token to session
        const token = process.env2.METACALL_TOKEN;
        const metacallAPI = protocolAPI(token, process.env2.METACALL_FAAS_BASE_URL);
        logger.info(name);
        const create_data = await metacallAPI.deploy(name, env, plan, resourceType);
        res.json({
            message: "deployed successfully",
            create_data
        });
    }
    catch (err) {
        const error = err;
        logger.error(error);
        res.status(500).json({
            message: "failed to create package"
        });
    }
};
export const undeploy = async (req, res) => {
    try {
        const prefix = req.body.prefix;
        const suffix = req.body.suffix;
        const version = req.body.version ?? "v1";
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Impvc2VAbWV0YWNhbGwuaW8iLCJpYXQiOjE2ODg2NTYzMjQsImV4cCI6MTY5MTI0ODMyNH0.EiXNu4KVOd90N0DkaAP0peVOwZCSFDG70LMjXvSw0Bg';
        const metacallAPI = protocolAPI(token, metacallBaseUrl);
        const create_data = await metacallAPI.deployDelete(prefix, suffix, version);
        res.json({
            message: "undeployed successfully",
            create_data
        });
    }
    catch (err) {
        const error = err;
        logger.error(error.message);
        res.status(500).json({
            message: "failed to create package"
        });
    }
};
export const getDeployments = async (req, res) => {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Impvc2VAbWV0YWNhbGwuaW8iLCJpYXQiOjE2ODg2NTYzMjQsImV4cCI6MTY5MTI0ODMyNH0.EiXNu4KVOd90N0DkaAP0peVOwZCSFDG70LMjXvSw0Bg';
        const metacallAPI = protocolAPI(token, metacallBaseUrl);
        const deployments = await metacallAPI.inspect();
        return res.json(deployments);
    }
    catch (err) {
        const error = err;
        logger.error(error.message);
        res.status(500).json({
            message: "failed to get deployments"
        });
    }
};
export const getStaticFile = async (req, res) => {
    try {
        const prefix = req.params.prefix;
        const suffix = req.params.suffix;
        const filename = req.params.filename;
        const fileContent = await axios.get(`https://api.metacall.io/${prefix}/${suffix}/v1/static/${filename}`).then(res => res.data);
        res.send(fileContent);
    }
    catch (err) {
        const error = err;
        logger.error(error.message);
        res.status(500).json({
            message: "failed to get static file"
        });
    }
};
