package online.playbraingames.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AdsConfiguration")
public class AdsConfigurationPlugin extends Plugin {
    @PluginMethod
    public void getConfiguration(PluginCall call) {
        call.resolve(AdsConfiguration.toJSObject());
    }
}
