"use client";

import { useState } from "react";
import { Bell, Shield, User, Palette, CreditCard, ChevronRight, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const riskLabels = ["Conservative", "Moderate", "Aggressive"];

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [extremeOnly, setExtremeOnly] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState([1]);

  const sections = [
    {
      title: "Profile",
      icon: User,
      items: [
        { label: "rohit-khadwal", sub: "Username", icon: User },
        { label: "anil.khadwal@gmail.com", sub: "Email", icon: User },
      ],
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences and account</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
            R
          </div>
          <div>
            <div className="font-bold">rohit-khadwal</div>
            <div className="text-sm text-muted-foreground">anil.khadwal@gmail.com</div>
            <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
              Free Plan
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Email Alerts</Label>
              <p className="text-xs text-muted-foreground">Risk alerts to your inbox</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Real-time browser alerts</p>
            </div>
            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Extreme Risk Only</Label>
              <p className="text-xs text-muted-foreground">Only alert on score 75+</p>
            </div>
            <Switch checked={extremeOnly} onCheckedChange={setExtremeOnly} />
          </div>
        </div>
      </div>

      {/* Risk tolerance */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Risk Tolerance</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profile</span>
            <span className="font-medium text-primary">{riskLabels[riskTolerance[0]]}</span>
          </div>
          <Slider
            value={riskTolerance}
            onValueChange={(val) => setRiskTolerance(Array.isArray(val) ? [...val] : [val as number])}
            min={0}
            max={2}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {riskLabels.map((l) => <span key={l}>{l}</span>)}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {riskTolerance[0] === 0
              ? "You'll receive warnings for stocks with risk score ≥ 40."
              : riskTolerance[0] === 1
              ? "You'll receive warnings for stocks with risk score ≥ 60."
              : "Warnings only for stocks with risk score ≥ 80."}
          </p>
        </div>
      </div>

      {/* Plan */}
      <div className="glass-card rounded-2xl p-5 border border-primary/15">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Plan & Billing</h3>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Free Plan</div>
            <div className="text-xs text-muted-foreground">5 analyses/day · Basic alerts</div>
          </div>
          <span className="text-xs bg-white/5 px-2 py-1 rounded-lg">Current</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Pro", price: "$9/mo", features: ["50 analyses/day", "Advanced alerts", "Journal analytics"] },
            { name: "Elite", price: "$29/mo", features: ["Unlimited analyses", "API access", "Priority alerts"] },
          ].map((plan) => (
            <div key={plan.name} className="border border-primary/20 rounded-xl p-3 bg-primary/5">
              <div className="font-bold text-primary">{plan.name}</div>
              <div className="font-mono text-sm mt-0.5">{plan.price}</div>
              <div className="mt-2 space-y-1">
                {plan.features.map((f) => (
                  <div key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-emerald-400">✓</span> {f}
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full bg-primary/15 hover:bg-primary/25 text-primary text-xs font-medium py-1.5 rounded-lg transition-colors">
                Upgrade
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Appearance</h3>
        </div>
        <div className="flex gap-2">
          {["Dark", "System"].map((theme) => (
            <button
              key={theme}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium border transition-colors",
                theme === "Dark"
                  ? "bg-primary/15 text-primary border-primary/20"
                  : "bg-white/3 text-muted-foreground border-white/8 hover:border-white/15"
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button className="w-full glass-card rounded-2xl p-4 flex items-center justify-between text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/10">
        <div className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign Out</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
