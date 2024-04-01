import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";
import { InlineProgramArgs, LocalWorkspace } from "@pulumi/pulumi/automation";
import mongoose from "mongoose";



const testMongoose = async () => {
    mongoose.connect('mongodb://localhost:27017/infrastructure', { authSource: "admin", user: "root", pass: "Passw0rd"})
    const MyModel = mongoose.model('Test', new Schema({ name: String }));
}

const Schema = mongoose.Schema
const UserSchema = new Schema({
    username: String,
    email: String,
    password: String
})

const projectSchema = new Schema({
    name: String,
    description: String,
    cores: Number,
    memory: Number,
    disk: Number,
})

const vmSchema = new Schema({
    image: String,
    name: String,
    privNetworkIP: String,
    serverType: String
})

type vmType = {
    id: string,
    image: string,
    name: string,
    privNetworkIP: string,
    serverType: string
}

testMongoose()

const UserModel = mongoose.model('User', UserSchema);
const projectModel = mongoose.model('Project', projectSchema);
const vmModel = mongoose.model('VM', vmSchema);
//find project by name
(async () => {
    const project = await projectModel.findOne({name: "project1"})
    console.log(project)
})()





// const vmList:any = [
//     {
//         id: "6696ba32-8168-4124-9d82-9ed390a7fdbf",
//         image: "ubuntu-22.04",
//         name: "vm1",
//         privNetworkIP: "10.0.1.16",
//         serverType: "cx11"
//     },
//     {
//         id: "55fbb38d-10a9-4551-a74c-a8538b3fb819",
//         image: "ubuntu-22.04",
//         name: "vm2",
//         privNetworkIP: "10.0.1.15",
//         serverType: "cx11"
//     },
// ]

const destroyList:any = []

let vmList:any = []

const pulumiProgram = async () => {
    try {
        const privNet = new hcloud.Network("privNet", { ipRange: "10.0.0.0/16" });
        const privNet_subnet = new hcloud.NetworkSubnet("default", {
            type: "cloud",
            networkId: privNet.id.apply(id => id as any) as any,
            networkZone: "eu-central",
            ipRange: "10.0.1.0/24"
        })


        let vmOutputs = vmList.map(vm => {
            const server = new hcloud.Server(vm.id, {
                image: vm.image,
                name: vm.name,
                publicNets: [
                    {
                        ipv4Enabled: true,
                        ipv6Enabled: true
                    }
                ],
                serverType: vm.serverType,
                networks: [
                    {
                        networkId: privNet.id.apply(id => id as any) as any,
                        ip: vm.privNetworkIP
                    }
                ]
            });
            return {
                id: vm.id,
                urn: server.urn
            };
        })
        return {
            vms: vmOutputs
        };
    } catch (error) {
        console.log("Error in pulumi program", error)
    }
}

const args: InlineProgramArgs = {
    stackName: "dev",
    projectName: "inlineNode",
    program: pulumiProgram,
};

const stackUpdate = async () => {
    try {
        let stackDown = true
        let stack = await LocalWorkspace.createOrSelectStack(args);
        stack
        await stack.setConfig("hcloud:token", { value: "I49l0ecg1j1jiytCrcLdkCS91QvKRFjNtLi10CNGjcoUzomGqHI0QjRShsHLBkI5"});
        if (destroyList.length > 0) {
            await stack.destroy({ onOutput: console.info, target: destroyList });
        } else {
            const upRes = await stack.up({ onOutput: console.info });
            // Extract and use the VM outputs here
            const vmOutputs = upRes.outputs.vms.value;
            // vmOutputs is an array of objects with `id` and `urn`
            console.log(vmOutputs);
            
            // Here you can iterate over vmOutputs to update your database
            vmOutputs.forEach(async (vm:any) => {
                console.log("output", vm)
            // Example pseudo-code for database update
            // await updateDatabase(vm.id, vm.urn);
            });
        }
    } catch (error) {
        console.log("Error updating stack.", error)
    }
}

let updating = false

//Poll for VM changes every 5 seconds
setInterval(async () => {
    
    if (updating) { return }
    updating = true
    const vmData = await vmModel.find()
    //set vmList to the new data but convert ObjectId to string
    vmList = vmData.map((vm:any) => {
        return {
            id: vm._id.toString(),
            image: vm.image,
            name: vm.name,
            privNetworkIP: vm.privNetworkIP,
            serverType: vm.serverType
        }
    })
    console.log(vmList)
        stackUpdate().then(() => {
            updating = false
        }).catch((error) => {
            console.log("Error updating stack.", error)
            updating = false
        })
}, 10000)
